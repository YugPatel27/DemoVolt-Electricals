import { Router } from "express";
import { db } from "../db.js";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySessionToken,
  destroyAllSessionsForUser,
  listSessionsForUser,
  createPasswordResetToken,
  consumePasswordResetToken,
  isAccountLocked,
  recordFailedLogin,
  resetFailedLogins,
  logActivity,
} from "../auth.js";
import {
  validateRegisterPayload,
  validateLoginPayload,
  validateForgotPasswordPayload,
  validateResetPasswordPayload,
} from "../validation.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { requireCsrfHeader } from "../middleware/csrf.js";
import { SESSION_COOKIE_NAME, requireAuth } from "../middleware/requireAuth.js";
import { config } from "../config.js";
import { sendPasswordResetEmail } from "../mail.js";

const router = Router();

function sessionCookieOptions(maxAgeMs) {
  return {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: config.cookieSameSite,
    maxAge: maxAgeMs,
    path: "/",
  };
}

function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

router.post(
  "/register",
  requireCsrfHeader,
  authLimiter,
  asyncHandler(async (req, res) => {
    const result = validateRegisterPayload(req.body);
    if (!result.isValid) {
      return res.status(400).json({ success: false, errors: result.errors });
    }
    const { name, email, password, age, phone } = result.data;

    const existing = db
      .prepare(`SELECT id FROM users WHERE email = ?`)
      .get(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        errors: ["An account with that email already exists."],
      });
    }

    const passwordHash = await hashPassword(password);
    const insertResult = db
      .prepare(
        `INSERT INTO users (name, email, password_hash, age, phone, terms_accepted_at)
         VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      )
      .run(name, email, passwordHash, age, phone);

    const userId = Number(insertResult.lastInsertRowid);
    const { token, maxAgeMs } = createSession(userId, {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });
    res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions(maxAgeMs));
    logActivity(userId, "register", { ip: req.ip });

    return res.status(201).json({
      success: true,
      user: toPublicUser({ id: userId, name, email, role: "customer" }),
    });
  }),
);

router.post(
  "/login",
  requireCsrfHeader,
  authLimiter,
  asyncHandler(async (req, res) => {
    const result = validateLoginPayload(req.body);
    if (!result.isValid) {
      return res.status(400).json({ success: false, errors: result.errors });
    }
    const { email, password } = result.data;

    const genericError = {
      success: false,
      errors: ["Invalid email or password."],
    };

    const user = db
      .prepare(
        `SELECT id, name, email, role, password_hash as passwordHash,
                failed_attempts as failedAttempts, locked_until as lockedUntil
         FROM users WHERE email = ?`,
      )
      .get(email);

    // Per-account lockout check — independent of the IP-based rate
    // limiter above, so a distributed brute-force attempt against this
    // one email address is still stopped even if it's spread across
    // many IPs. Checked before the password comparison so a locked
    // account doesn't leak timing info about whether the password would
    // otherwise have matched.
    if (isAccountLocked(user)) {
      return res.status(423).json({
        success: false,
        errors: [
          "Too many failed attempts. This account is temporarily locked — please try again in 15 minutes or reset your password.",
        ],
      });
    }

    // Always run bcrypt.compare even when the user doesn't exist, against a
    // fixed dummy hash, so response timing doesn't reveal whether the
    // email is registered.
    const passwordMatches = await verifyPassword(
      password,
      user?.passwordHash ||
        "$2a$12$CwaJ4z2wY0nZQeYh0h1XyOe8x8n2W1B0N7t8j1nQeY9wYh0h1XyOe",
    );

    if (!user || !passwordMatches) {
      if (user) {
        recordFailedLogin(user.id);
        logActivity(user.id, "login_failed", { ip: req.ip });
      }
      return res.status(401).json(genericError);
    }

    resetFailedLogins(user.id);

    const { token, maxAgeMs } = createSession(user.id, {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });
    res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions(maxAgeMs));
    logActivity(user.id, "login", { ip: req.ip });

    return res.json({ success: true, user: toPublicUser(user) });
  }),
);

router.post(
  "/logout",
  requireCsrfHeader,
  asyncHandler(async (req, res) => {
    const token = req.cookies?.[SESSION_COOKIE_NAME];
    if (token) destroySessionToken(token);
    if (req.user) logActivity(req.user.id, "logout", { ip: req.ip });
    res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
    return res.json({ success: true });
  }),
);

const GENERIC_FORGOT_PASSWORD_MESSAGE =
  "If an account exists for that email, we've sent a password reset link.";

router.post(
  "/forgot-password",
  requireCsrfHeader,
  authLimiter,
  asyncHandler(async (req, res) => {
    const result = validateForgotPasswordPayload(req.body);
    if (!result.isValid) {
      return res.status(400).json({ success: false, errors: result.errors });
    }

    const user = db
      .prepare(`SELECT id, email FROM users WHERE email = ?`)
      .get(result.data.email);

    // Always respond identically whether or not the account exists —
    // otherwise this endpoint becomes an email-enumeration oracle.
    if (user) {
      const { token } = createPasswordResetToken(user.id);
      const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`;
      try {
        await sendPasswordResetEmail(user.email, resetUrl);
      } catch (err) {
        // Don't leak delivery failures to the client — same generic
        // response either way — but do log server-side so it's visible
        // in monitoring that reset emails aren't going out.
        console.error("[Auth] Failed to send password reset email:", err.message);
      }
    }

    return res.json({ success: true, message: GENERIC_FORGOT_PASSWORD_MESSAGE });
  }),
);

router.post(
  "/reset-password",
  requireCsrfHeader,
  authLimiter,
  asyncHandler(async (req, res) => {
    const result = validateResetPasswordPayload(req.body);
    if (!result.isValid) {
      return res.status(400).json({ success: false, errors: result.errors });
    }

    const userId = consumePasswordResetToken(result.data.token);
    if (!userId) {
      return res.status(400).json({
        success: false,
        errors: ["This reset link is invalid or has expired. Please request a new one."],
      });
    }

    const passwordHash = await hashPassword(result.data.password);
    db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(
      passwordHash,
      userId,
    );

    // Invalidate every existing session — a password reset is a strong
    // signal the old password (and any session established with it) may
    // no longer be trustworthy, and the person doing the resetting
    // should end up in a clean, single logged-in state on this device.
    destroyAllSessionsForUser(userId);
    const { token, maxAgeMs } = createSession(userId, {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });
    res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions(maxAgeMs));
    logActivity(userId, "password_reset", { ip: req.ip });

    return res.json({ success: true });
  }),
);

router.get("/me", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, errors: ["Not logged in."] });
  }
  return res.json({ success: true, user: toPublicUser(req.user) });
});

// "Sign out of all devices". Keeps the current session alive by default;
// pass { everywhere: true } to also log the current device out.
router.post(
  "/sessions/revoke-all",
  requireCsrfHeader,
  requireAuth,
  asyncHandler(async (req, res) => {
    const currentToken = req.cookies?.[SESSION_COOKIE_NAME];
    const signOutCurrentToo = req.body?.everywhere === true;

    destroyAllSessionsForUser(
      req.user.id,
      signOutCurrentToo ? undefined : currentToken,
    );

    if (signOutCurrentToo) {
      res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
    }

    return res.json({ success: true });
  }),
);

// Lists active sessions for the account page. Only exposes metadata
// (creation/expiry time) — never the token itself, which only exists
// hashed in the DB anyway.
router.get(
  "/sessions",
  requireAuth,
  asyncHandler(async (req, res) => {
    const sessions = listSessionsForUser(req.user.id).map((s) => ({
      createdAt: s.createdAt,
      expiresAt: new Date(s.expiresAt).toISOString(),
    }));
    return res.json({ success: true, sessions });
  }),
);

// Self-service data export (DPDP right to access). Returns everything
// the account holds — profile plus cart contents.
router.get(
  "/me/export",
  requireAuth,
  asyncHandler(async (req, res) => {
    const cartItems = db
      .prepare(`SELECT * FROM cart_items WHERE user_id = ?`)
      .all(req.user.id);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="volamp-account-data.json"`,
    );
    return res.json({
      exportedAt: new Date().toISOString(),
      user: toPublicUser(req.user),
      cartItems,
    });
  }),
);

// Self-service account deletion (DPDP right to erasure). Cart items and
// sessions cascade automatically via the existing FK constraints.
router.delete(
  "/me",
  requireCsrfHeader,
  requireAuth,
  asyncHandler(async (req, res) => {
    db.prepare(`DELETE FROM users WHERE id = ?`).run(req.user.id);
    res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
    return res.json({ success: true });
  }),
);

export default router;
