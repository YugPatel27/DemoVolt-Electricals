import "dotenv/config";

/**
 * Centralized, validated environment configuration.
 * Fail fast at startup if required values are missing or malformed,
 * rather than surfacing confusing errors later at request time.
 */

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:5000",
  "http://localhost:3000",
];

function parseOrigins(raw) {
  if (!raw) return DEFAULT_ALLOWED_ORIGINS;
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function parsePositiveInt(raw, fallback) {
  const parsed = Number.parseInt(raw, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export const config = {
  env: process.env.NODE_ENV || "development",
  port: parsePositiveInt(process.env.PORT, 3001),
  allowedOrigins: parseOrigins(process.env.ALLOWED_ORIGINS),

  // Base URL of the frontend, used to build links sent in emails (e.g.
  // password reset). Defaults to the first allowed CORS origin, which is
  // almost always correct since that's already "the frontend's origin"
  // by definition — override explicitly if that's ever not the case.
  frontendUrl: process.env.FRONTEND_URL || parseOrigins(process.env.ALLOWED_ORIGINS)[0],

  // Body size limit — public form payloads are small; this also caps
  // the attack surface for large-payload denial-of-service attempts.
  bodyLimit: process.env.BODY_LIMIT || "100kb",

  // Rate limiting for public, unauthenticated write endpoints.
  rateLimit: {
    windowMs: parsePositiveInt(
      process.env.RATE_LIMIT_WINDOW_MS,
      15 * 60 * 1000,
    ), // 15 min
    max: parsePositiveInt(process.env.RATE_LIMIT_MAX, 20), // requests per window per IP
  },

  // Tighter rate limiting for login/register, which are prime brute-force
  // and account-enumeration targets.
  authRateLimit: {
    windowMs: parsePositiveInt(
      process.env.AUTH_RATE_LIMIT_WINDOW_MS,
      15 * 60 * 1000,
    ), // 15 min
    max: parsePositiveInt(process.env.AUTH_RATE_LIMIT_MAX, 10), // attempts per window per IP
  },

  // Session cookie behavior. In production the frontend and API are
  // typically on different origins, so the cookie needs SameSite=None +
  // Secure (requires HTTPS). In local development they're usually served
  // through the same dev-server origin (via a proxy), so Lax + non-secure
  // works over plain HTTP.
  cookieSecure: process.env.NODE_ENV === "production",
  cookieSameSite: process.env.NODE_ENV === "production" ? "none" : "lax",

  // Set to true when running behind a reverse proxy / load balancer
  // (Render, Railway, Heroku, nginx, etc.) so req.ip and rate limiting
  // use the real client IP from X-Forwarded-For rather than the proxy's.
  trustProxy: process.env.TRUST_PROXY === "true",
};

export function assertConfigIsValid() {
  const problems = [];

  if (config.env === "production" && config.allowedOrigins.length === 0) {
    problems.push(
      "ALLOWED_ORIGINS must be set to at least one origin in production.",
    );
  }

  if (problems.length > 0) {
    console.error("[Config] Invalid configuration detected:");
    problems.forEach((problem) => console.error(`  - ${problem}`));
    throw new Error("Refusing to start with invalid configuration.");
  }

  if (
    config.env === "production" &&
    config.allowedOrigins.some((origin) => origin.includes("localhost"))
  ) {
    console.warn(
      "[Config] Warning: ALLOWED_ORIGINS contains a localhost entry in production.",
    );
  }
}
