import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { db } from "./db.js";

const BCRYPT_ROUNDS = 12;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function hashToken(token) {
  // Sessions tokens are already high-entropy (256 bits of randomness), so
  // this isn't protecting against guessing — it's so that a leaked copy of
  // the database file alone (e.g. a misconfigured backup) doesn't hand out
  // live, usable session tokens the way storing them in plaintext would.
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Creates a new session for a user and returns the raw token to set as a
 * cookie. Only the hash of the token is ever persisted. ip/userAgent are
 * stored for account-security purposes (recognizing devices, the admin
 * activity view) — not for behavioral tracking.
 */
export function createSession(userId, { ip, userAgent } = {}) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_TTL_MS;

  db.prepare(
    `INSERT INTO sessions (token_hash, user_id, expires_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)`,
  ).run(hashToken(token), userId, expiresAt, ip ?? null, userAgent ?? null);

  return { token, expiresAt, maxAgeMs: SESSION_TTL_MS };
}

/**
 * Looks up the user attached to a raw session token. Returns null if the
 * token is missing, unknown, or expired (and cleans up expired rows as it
 * goes, rather than requiring a separate cleanup job).
 */
export function getUserForSessionToken(token) {
  if (!token || typeof token !== "string") return null;

  const tokenHash = hashToken(token);
  const row = db
    .prepare(
      `SELECT s.user_id as userId, s.expires_at as expiresAt,
              u.id, u.name, u.email, u.role
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ?`,
    )
    .get(tokenHash);

  if (!row) return null;

  if (row.expiresAt < Date.now()) {
    db.prepare(`DELETE FROM sessions WHERE token_hash = ?`).run(tokenHash);
    return null;
  }

  // Sliding expiration: once a session is more than halfway to expiry,
  // push it back out to a full TTL from now so active users aren't logged
  // out mid-session. Only writes when needed, not on every single request.
  if (row.expiresAt - Date.now() < SESSION_TTL_MS / 2) {
    const newExpiresAt = Date.now() + SESSION_TTL_MS;
    db.prepare(`UPDATE sessions SET expires_at = ? WHERE token_hash = ?`).run(
      newExpiresAt,
      tokenHash,
    );
  }

  return { id: row.id, name: row.name, email: row.email, role: row.role };
}

export function destroySessionToken(token) {
  if (!token) return;
  db.prepare(`DELETE FROM sessions WHERE token_hash = ?`).run(hashToken(token));
}

/**
 * "Sign out of all devices" — invalidates every session for a user.
 * Pass an active token to exclude it (e.g. keep the current session alive
 * while revoking the rest); omit to sign out everywhere including here.
 */
export function destroyAllSessionsForUser(userId, keepToken) {
  if (keepToken) {
    db.prepare(
      `DELETE FROM sessions WHERE user_id = ? AND token_hash != ?`,
    ).run(userId, hashToken(keepToken));
  } else {
    db.prepare(`DELETE FROM sessions WHERE user_id = ?`).run(userId);
  }
}

export function listSessionsForUser(userId) {
  return db
    .prepare(
      `SELECT token_hash as tokenHash, expires_at as expiresAt, created_at as createdAt
       FROM sessions WHERE user_id = ? ORDER BY created_at DESC`,
    )
    .all(userId);
}

/** Sweeps rows that expired without ever being looked up again. */
export function cleanupExpiredSessions() {
  db.prepare(`DELETE FROM sessions WHERE expires_at < ?`).run(Date.now());
  db.prepare(`DELETE FROM password_resets WHERE expires_at < ?`).run(
    Date.now(),
  );
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Per-account brute-force protection, independent of the IP-based
 * authLimiter. IP rate limiting alone doesn't stop a distributed attempt
 * against one specific email address — this does, by tracking failures
 * on the account itself regardless of which IP they come from.
 */
export function isAccountLocked(user) {
  return Boolean(user?.lockedUntil && user.lockedUntil > Date.now());
}

export function recordFailedLogin(userId) {
  const user = db
    .prepare(`SELECT failed_attempts as failedAttempts FROM users WHERE id = ?`)
    .get(userId);
  if (!user) return;

  const nextCount = user.failedAttempts + 1;
  const lockedUntil =
    nextCount >= MAX_FAILED_ATTEMPTS ? Date.now() + LOCKOUT_DURATION_MS : null;

  db.prepare(
    `UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?`,
  ).run(nextCount, lockedUntil, userId);
}

export function resetFailedLogins(userId) {
  db.prepare(
    `UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?`,
  ).run(userId);
}

/**
 * Records a security/business-relevant event for the admin activity view.
 * Deliberately scoped to auth, cart, and enquiry events — not a generic
 * "log every click" tracker. `detail` should be a short, non-sensitive
 * description (e.g. a product slug or enquiry id), never raw PII — the
 * same principle already applied to console logging elsewhere in this
 * codebase (see mail.js, routes/api.js).
 */
export function logActivity(userId, action, { ip, detail } = {}) {
  db.prepare(
    `INSERT INTO activity_log (user_id, action, detail, ip_address) VALUES (?, ?, ?, ?)`,
  ).run(userId ?? null, action, detail ?? null, ip ?? null);
}

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Issues a single-use password-reset token for a user. Any previously
 * issued, still-valid tokens for this user are invalidated first, so
 * requesting a new reset link always supersedes an older one rather than
 * leaving multiple valid tokens outstanding.
 */
export function createPasswordResetToken(userId) {
  db.prepare(`DELETE FROM password_resets WHERE user_id = ?`).run(userId);

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + RESET_TOKEN_TTL_MS;

  db.prepare(
    `INSERT INTO password_resets (token_hash, user_id, expires_at) VALUES (?, ?, ?)`,
  ).run(hashToken(token), userId, expiresAt);

  return { token, expiresAt };
}

/**
 * Validates and immediately consumes (deletes) a reset token. Returns the
 * associated userId, or null if the token is missing, unknown, or
 * expired. Single-use by construction — a token can't be replayed even
 * if intercepted after use.
 */
export function consumePasswordResetToken(token) {
  if (!token || typeof token !== "string") return null;

  const tokenHash = hashToken(token);
  const row = db
    .prepare(
      `SELECT user_id as userId, expires_at as expiresAt FROM password_resets WHERE token_hash = ?`,
    )
    .get(tokenHash);

  if (!row) return null;

  db.prepare(`DELETE FROM password_resets WHERE token_hash = ?`).run(
    tokenHash,
  );

  if (row.expiresAt < Date.now()) return null;

  return row.userId;
}
