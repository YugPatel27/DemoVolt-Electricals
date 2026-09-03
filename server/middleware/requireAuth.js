import { getUserForSessionToken } from "../auth.js";

export const SESSION_COOKIE_NAME = "volamp_sid";

/**
 * Reads the session cookie (if present) and attaches the corresponding
 * user to req.user, without rejecting the request. Lets public routes
 * optionally know "who's asking" without forcing a login.
 */
export function attachUser(req, res, next) {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  req.user = token ? getUserForSessionToken(token) : null;
  next();
}

/**
 * Rejects the request with 401 unless a valid session is attached.
 * Must run after attachUser.
 */
export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      errors: ["You must be logged in to do that."],
    });
  }
  next();
}

/**
 * Restricts a route to specific roles (e.g. "admin", or "admin"/"staff"
 * for read-only admin views). Must run after requireAuth. Returns 403
 * (not 404) — this is deliberately visible as "exists but you can't use
 * it" rather than hidden, since the admin panel itself already isn't
 * linked from public navigation.
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        errors: ["You don't have permission to do that."],
      });
    }
    next();
  };
}
