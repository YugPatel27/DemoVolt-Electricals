// Thin fetch wrapper around the Volamp backend API.
//
// - Always sends/receives cookies (`credentials: "include"`) since auth is
//   session-cookie based.
// - Attaches the `X-Requested-With` header the backend's CSRF middleware
//   requires on every mutating request (see server/middleware/csrf.js).
// - Normalizes error handling: any non-2xx or `{ success: false }` response
//   throws an `ApiError` carrying the backend's `errors` array so callers
//   can show them directly.

export const API_URL = import.meta.env.VITE_API_URL || "/api";

export class ApiError extends Error {
  constructor(errors, status) {
    super(errors?.[0] || "Something went wrong. Please try again.");
    this.errors = errors && errors.length ? errors : [this.message];
    this.status = status;
  }
}

const MUTATING_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

export async function apiFetch(path, { method = "GET", body } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (MUTATING_METHODS.has(method)) {
    headers["X-Requested-With"] = "volamp-spa";
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      credentials: "include",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(["Couldn't reach the server. Check your connection."]);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // no/invalid JSON body (e.g. some network errors) — fall through
  }

  if (!response.ok || !data?.success) {
    throw new ApiError(data?.errors, response.status);
  }

  return data;
}
