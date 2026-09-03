// Single source of truth for reading/writing cookie consent, shared
// between the CookieBanner UI and any script that needs to check consent
// before running (analytics, marketing pixels, embeds, etc.).
//
// Today nothing in this codebase actually loads analytics/marketing
// scripts, so this gate has nothing to guard yet — but it exists now so
// that the *next* script added is built correctly from day one, wrapped
// in loadIfConsented(), instead of the consent banner staying purely
// decorative until someone remembers to wire it up.

export const CONSENT_STORAGE_KEY = "volamp.cookies.v1";
const CONSENT_EVENT = "volamp:consent-changed";

const DEFAULT_PREFS = { essential: true, analytics: false, marketing: false };

/**
 * Returns the stored consent preferences, or null if the person hasn't
 * made a choice yet (banner not yet dismissed).
 */
export function getConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

/**
 * Checks whether a specific category has been consented to.
 * "essential" is always true — it's not actually optional, just labeled
 * for transparency in the UI.
 */
export function hasConsent(category) {
  if (category === "essential") return true;
  const prefs = getConsent();
  return Boolean(prefs?.[category]);
}

/**
 * Persists a consent decision and notifies any listeners in the current
 * tab immediately (native "storage" events only fire in *other* tabs, so
 * a custom event is needed for same-tab reactivity — e.g. a script
 * waiting to load the moment analytics consent is granted).
 */
export function saveConsent(nextPrefs) {
  const value = { ...DEFAULT_PREFS, ...nextPrefs, ts: Date.now() };
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Ignore storage failures (private browsing, quota, etc.) — the
    // banner still dismisses, and hasConsent() will simply keep
    // returning false for optional categories on this device.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
  return value;
}

/** Subscribes to consent changes; returns an unsubscribe function. */
export function onConsentChange(callback) {
  const handler = (e) => callback(e.detail);
  window.addEventListener(CONSENT_EVENT, handler);
  return () => window.removeEventListener(CONSENT_EVENT, handler);
}

/**
 * Convenience wrapper for the next analytics/marketing script that gets
 * added: only runs `loaderFn` if consent for `category` is already
 * granted, and re-checks whenever consent changes (e.g. the person
 * accepts later via the preferences banner) — without needing a page
 * reload.
 *
 * Example (when a real analytics script is eventually added):
 *   loadIfConsented("analytics", () => {
 *     const s = document.createElement("script");
 *     s.src = "https://analytics.example.com/script.js";
 *     document.head.appendChild(s);
 *   });
 */
export function loadIfConsented(category, loaderFn) {
  let loaded = false;
  const tryLoad = () => {
    if (!loaded && hasConsent(category)) {
      loaded = true;
      loaderFn();
    }
  };
  tryLoad();
  return onConsentChange(tryLoad);
}
