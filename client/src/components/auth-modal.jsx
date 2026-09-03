import { useEffect, useState } from "react";
import { X, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../lib/auth-context";
import { sanitize } from "../lib/validate";

export function AuthModal({ onSuccess, onClose }) {
  const { login, register, forgotPassword } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register" | "forgot"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const switchMode = (next) => {
    setMode(next);
    setErrors([]);
    setForgotSent(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      const cleanName = sanitize(name, 100);
      const cleanEmail = sanitize(email, 150);
      if (mode === "register") {
        await register(
          cleanName,
          cleanEmail,
          password,
          termsAccepted,
          age,
          sanitize(phone, 20),
        );
        onSuccess();
      } else if (mode === "forgot") {
        await forgotPassword(cleanEmail);
        setForgotSent(true);
      } else {
        await login(cleanEmail, password);
        onSuccess();
      }
    } catch (err) {
      setErrors(err.errors || [err.message]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-fade-up ring-1 ring-black/5">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-foreground/50 hover:bg-black/5 hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--maroon)]/5">
            {mode === "register" ? (
              <UserPlus className="h-5 w-5 text-[color:var(--maroon)]" />
            ) : (
              <LogIn className="h-5 w-5 text-[color:var(--maroon)]" />
            )}
          </div>

          <h2 className="mt-4 font-display text-2xl font-bold text-[color:var(--maroon)] leading-tight">
            {mode === "login" && "Log in to continue"}
            {mode === "register" && "Create your account"}
            {mode === "forgot" && "Reset your password"}
          </h2>
          <p className="mt-1.5 text-sm text-foreground/60">
            {mode === "login" &&
              "Sign in to add items to your cart and request quotes."}
            {mode === "register" &&
              "Set up an account to start building your cart."}
            {mode === "forgot" &&
              (forgotSent
                ? "Check your inbox for a link to set a new password."
                : "Enter your account email and we'll send you a reset link.")}
          </p>

          {mode === "forgot" && forgotSent ? (
            <button
              onClick={() => switchMode("login")}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[color:var(--frame)]/60 px-4 py-3 text-sm font-bold text-[color:var(--maroon)] transition-colors hover:bg-[color:var(--maroon)]/5"
            >
              Back to login
            </button>
          ) : (
          <>
          <form onSubmit={submit} className="mt-6 grid gap-3.5">
            {mode === "register" && (
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground/50">
                  Name
                </label>
                <input
                  required
                  maxLength={100}
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-[color:var(--frame)]/60 bg-background px-3.5 py-2.5 text-sm outline-none focus:border-[color:var(--orange)] transition-colors"
                />
              </div>
            )}

            {mode === "register" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground/50">
                    Age
                  </label>
                  <input
                    required
                    type="number"
                    min={18}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="18+"
                    className="w-full rounded-xl border border-[color:var(--frame)]/60 bg-background px-3.5 py-2.5 text-sm outline-none focus:border-[color:var(--orange)] transition-colors"
                  />
                  <p className="mt-1 text-[10px] text-foreground/40">
                    Must be 18 or older
                  </p>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground/50">
                    Phone{" "}
                    <span className="normal-case font-medium text-foreground/30">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="tel"
                    maxLength={20}
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    className="w-full rounded-xl border border-[color:var(--frame)]/60 bg-background px-3.5 py-2.5 text-sm outline-none focus:border-[color:var(--orange)] transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground/50">
                Email
              </label>
              <input
                required
                type="email"
                maxLength={150}
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-[color:var(--frame)]/60 bg-background px-3.5 py-2.5 text-sm outline-none focus:border-[color:var(--orange)] transition-colors"
              />
            </div>

            {mode !== "forgot" && (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground/50">
                    Password
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => switchMode("forgot")}
                      className="text-xs font-semibold text-[color:var(--orange)] hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  required
                  type="password"
                  minLength={8}
                  maxLength={200}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    mode === "register" ? "At least 8 characters" : "••••••••"
                  }
                  className="w-full rounded-xl border border-[color:var(--frame)]/60 bg-background px-3.5 py-2.5 text-sm outline-none focus:border-[color:var(--orange)] transition-colors"
                />
              </div>
            )}

            {mode === "register" && (
              <label className="flex items-start gap-2 text-[11px] font-medium text-foreground/70">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-[color:var(--frame)]/40 accent-[color:var(--orange)]"
                />
                <span>
                  I agree to the{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-semibold text-[color:var(--orange)]"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-semibold text-[color:var(--orange)]"
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>
            )}

            {errors.length > 0 && (
              <ul className="space-y-0.5">
                {errors.map((err, idx) => (
                  <li key={idx} className="text-xs font-medium text-red-600">
                    {err}
                  </li>
                ))}
              </ul>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl brand-gradient px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[color:var(--orange)]/20 transition-transform hover:-translate-y-0.5 disabled:opacity-70"
            >
              {submitting
                ? "Please wait..."
                : mode === "login"
                  ? "Log in"
                  : mode === "register"
                    ? "Create account"
                    : "Send reset link"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-foreground/60">
            {mode === "login" && (
              <>
                New here?{" "}
                <button
                  onClick={() => switchMode("register")}
                  className="font-semibold text-[color:var(--orange)] hover:underline"
                >
                  Create an account
                </button>
              </>
            )}
            {mode === "register" && (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => switchMode("login")}
                  className="font-semibold text-[color:var(--orange)] hover:underline"
                >
                  Log in
                </button>
              </>
            )}
            {mode === "forgot" && (
              <button
                onClick={() => switchMode("login")}
                className="font-semibold text-[color:var(--orange)] hover:underline"
              >
                Back to login
              </button>
            )}
          </p>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
