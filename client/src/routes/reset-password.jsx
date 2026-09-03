import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, KeyRound } from "lucide-react";
import { PageHero, Section } from "../components/site-bits";
import { useAuth } from "../lib/auth-context";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErrors([]);

    if (!token) {
      setErrors(["This reset link is missing its token — please use the link from your email."]);
      return;
    }
    if (password !== confirmPassword) {
      setErrors(["Passwords don't match."]);
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setErrors(err.errors || [err.message]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Account"
        title="Set a new password."
        subtitle="Choose a new password for your Volamp account."
      />
      <Section className="max-w-md">
        <div className="rounded-2xl border border-[color:var(--frame)]/40 bg-card p-6 md:p-8 shadow-xs">
          {!token ? (
            <div className="text-center">
              <p className="text-sm font-medium text-destructive">
                This link is missing its reset token.
              </p>
              <p className="mt-2 text-xs text-foreground/60">
                Please use the link from the password reset email, or request
                a new one.
              </p>
            </div>
          ) : done ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
              <p className="mt-3 text-sm font-bold text-[color:var(--maroon)]">
                Password updated.
              </p>
              <p className="mt-1 text-xs text-foreground/60">
                You're signed in on this device with your new password.
              </p>
              <button
                onClick={() => navigate("/")}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg brand-gradient px-4 py-2.5 text-xs font-bold text-white hover:opacity-95 cursor-pointer shadow-sm"
              >
                Continue to Volamp
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--maroon)]/5">
                <KeyRound className="h-5 w-5 text-[color:var(--maroon)]" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground/50">
                  New password
                </label>
                <input
                  required
                  type="password"
                  minLength={8}
                  maxLength={200}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-[color:var(--frame)]/60 bg-background px-3.5 py-2.5 text-sm outline-none focus:border-[color:var(--orange)] transition-colors"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground/50">
                  Confirm new password
                </label>
                <input
                  required
                  type="password"
                  minLength={8}
                  maxLength={200}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full rounded-xl border border-[color:var(--frame)]/60 bg-background px-3.5 py-2.5 text-sm outline-none focus:border-[color:var(--orange)] transition-colors"
                />
              </div>
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
                {submitting ? "Updating..." : "Update password"}
              </button>
              <p className="text-center text-xs text-foreground/60">
                <Link
                  to="/"
                  className="font-semibold text-[color:var(--orange)] hover:underline"
                >
                  Back to Volamp
                </Link>
              </p>
            </form>
          )}
        </div>
      </Section>
    </>
  );
}
