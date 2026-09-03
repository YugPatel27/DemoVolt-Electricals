import { config } from "../config.js";

/**
 * Catches requests to unknown routes with a consistent JSON shape,
 * instead of Express's default HTML 404 page.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    errors: [`No route found for ${req.method} ${req.originalUrl}`],
  });
}

/**
 * Single place where every error in the app ends up. Keeping this last
 * in the middleware chain means route handlers can just `next(err)` or
 * throw inside an asyncHandler-wrapped function and never worry about
 * response formatting or leaking internals.
 */
export function errorHandler(err, req, res, next) {
  // Malformed JSON body from express.json() surfaces here as a SyntaxError.
  if (err.type === "entity.parse.failed" || err instanceof SyntaxError) {
    return res.status(400).json({
      success: false,
      errors: ["Request body must be valid JSON."],
    });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      errors: ["Request payload is too large."],
    });
  }

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      errors: ["This origin is not permitted to access the API."],
    });
  }

  const status = Number.isInteger(err.status) ? err.status : 500;

  // Never leak stack traces or internal error messages to the client in
  // production. Full detail always goes to the server logs.

  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  const isProduction = config.env === "production";
  const clientMessage =
    status === 500
      ? "Something went wrong on our end. Please try again shortly."
      : err.message || "Request failed.";

  res.status(status).json({
    success: false,
    errors: [clientMessage],
    ...(isProduction ? {} : { stack: err.stack }),
  });
}
