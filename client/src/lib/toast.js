/**
 * Lightweight toast notification system.
 * Uses a custom event bus so any component can fire toasts without prop drilling.
 */

const listeners = new Set();

export function showToast({ message, type = "success", duration = 3000 }) {
  const id = crypto.randomUUID();
  const toast = { id, message, type, duration };
  listeners.forEach((fn) => fn({ action: "add", toast }));
  setTimeout(() => {
    listeners.forEach((fn) => fn({ action: "remove", id }));
  }, duration);
}

export function subscribeToasts(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
