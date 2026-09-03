/**
 * Defense-in-depth CSRF mitigation for cookie-authenticated endpoints.
 *
 * The frontend is required to send a custom header on every mutating
 * request. Cross-site HTML forms and <img>/<script> style CSRF vectors
 * cannot set custom headers, and any cross-origin fetch/XHR that tries to
 * set one triggers a CORS preflight — which our strict origin allowlist
 * (see config.allowedOrigins) already rejects. Combined with SameSite
 * cookies, this closes the classic CSRF vectors without needing a
 * separate token-issuing endpoint.
 */
export function requireCsrfHeader(req, res, next) {
  if (req.get("X-Requested-With") !== "volamp-spa") {
    return res.status(403).json({
      success: false,
      errors: ["Request rejected: missing required client header."],
    });
  }
  next();
}
