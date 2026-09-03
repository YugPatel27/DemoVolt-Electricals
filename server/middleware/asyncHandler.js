/**
 * Wraps an async route handler so any rejected promise is forwarded to
 * Express's error-handling middleware via next(err), instead of crashing
 * the process or hanging the request. Express 4 does not do this
 * automatically for async functions.
 *
 * Usage: router.post("/thing", asyncHandler(async (req, res) => { ... }));
 */
export function asyncHandler(handler) {
  return function wrappedHandler(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
