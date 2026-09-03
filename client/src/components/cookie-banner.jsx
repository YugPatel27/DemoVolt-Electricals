import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getConsent, saveConsent } from "../lib/consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    if (!getConsent()) setVisible(true);
  }, []);

  const save = (nextPrefs) => {
    saveConsent(nextPrefs);
    setVisible(false);
  };

  if (!visible) return null;
  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-xl border border-[color:var(--frame)]/60 bg-white shadow-2xl animate-fade-up">
      <div className="p-4 md:p-5">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="font-display text-lg font-bold text-[color:var(--maroon)]">
              We value your privacy
            </p>
            <p className="mt-1 text-sm text-foreground/70">
              We use essential cookies to keep the site working, and optional
              analytics / personalisation cookies to improve your experience.
              You can accept all or manage preferences.
            </p>
            {showPrefs && (
              <div className="mt-3 grid gap-2 text-sm">
                <Row
                  label="Essential"
                  desc="Required for the site to function."
                  locked
                />

                <Row
                  label="Analytics"
                  desc="Anonymous usage stats."
                  checked={prefs.analytics}
                  onChange={(isChecked) =>
                    setPrefs((prev) => ({ ...prev, analytics: isChecked }))
                  }
                />

                <Row
                  label="Personalisation"
                  desc="Remember preferences & tailor content."
                  checked={prefs.marketing}
                  onChange={(isChecked) =>
                    setPrefs((prev) => ({ ...prev, marketing: isChecked }))
                  }
                />
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() =>
                  save({ essential: true, analytics: true, marketing: true })
                }
                className="rounded-md brand-gradient px-4 py-2 text-sm font-semibold text-white"
              >
                Accept all
              </button>
              <button
                onClick={() =>
                  save({ essential: true, analytics: false, marketing: false })
                }
                className="rounded-md border border-[color:var(--maroon)] px-4 py-2 text-sm font-semibold text-[color:var(--maroon)]"
              >
                Reject optional
              </button>
              <button
                onClick={() => setShowPrefs((isOpen) => !isOpen)}
                className="rounded-md px-4 py-2 text-sm font-semibold text-foreground/70 hover:text-[color:var(--maroon)]"
              >
                {showPrefs ? "Hide preferences" : "Preferences"}
              </button>
            </div>
          </div>
          <button
            aria-label="Dismiss"
            onClick={() => save(prefs)}
            className="text-foreground/50 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, desc, checked, locked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border border-[color:var(--frame)]/40 px-3 py-2">
      <span>
        <span className="font-semibold text-[color:var(--maroon)]">
          {label}
        </span>
        <span className="ml-2 text-xs text-foreground/60">{desc}</span>
      </span>
      <input
        type="checkbox"
        checked={locked ? true : !!checked}
        disabled={locked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="h-4 w-4 accent-[color:var(--orange)]"
      />
    </label>
  );
}
