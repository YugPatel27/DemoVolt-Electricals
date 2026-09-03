import rateLimit from "express-rate-limit";
import { config } from "../config.js";

/**
 * Applied to public, unauthenticated POST endpoints (contact form, quote
 * requests) to blunt scripted spam and brute-force submission floods.
 * Keyed by IP, so it relies on `trustProxy` being configured correctly
 * when the app sits behind a load balancer.
 */
export const formSubmissionLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true, // RateLimit-* response headers
  legacyHeaders: false,
  message: {
    success: false,
    errors: ["Too many requests. Please try again later."],
  },
});

/**
 * Applied to /api/auth/login and /api/auth/register — tighter than the
 * general form limiter since these are the prime brute-force and
 * account-enumeration / spam-registration targets.
 */
export const authLimiter = rateLimit({
  windowMs: config.authRateLimit.windowMs,
  max: config.authRateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    errors: ["Too many attempts. Please try again later."],
  },
});
