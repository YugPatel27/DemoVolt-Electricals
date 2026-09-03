import { useState } from "react";
import { Send } from "lucide-react";
import { PageHero, Section, Eyebrow, H2 } from "../components/site-bits";
import {
  isPhone,
  sanitize,
  buildWhatsAppUrl,
  VOLAMP_WA,
} from "../lib/validate";
import { API_URL } from "../lib/api";

export default function BulkQuote() {
  const [form, setForm] = useState({
    name: "",
    firm: "",
    phone: "",
    email: "",
    site: "",
    bom: "",
    consent: false,
  });
  const [err, setErr] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setSuccess(null);

    const cleanValues = Object.fromEntries(
      Object.entries(form)
        .filter(([field]) => field !== "consent")
        .map(([field, val]) => [
          field,
          sanitize(val, field === "bom" ? 1800 : 200),
        ]),
    );

    if (!cleanValues.name || !cleanValues.firm)
      return setErr("Please fill name and firm.");
    if (!isPhone(cleanValues.phone))
      return setErr("Enter a valid phone number.");
    if (!cleanValues.email)
      return setErr("Please share an email address so we can send your quote.");
    if (!cleanValues.bom) return setErr("Please share your BOM / requirement.");
    if (!form.consent)
      return setErr("Please confirm you agree to the Privacy Policy.");

    setSubmitting(true);
    let recorded = false;
    try {
      const res = await fetch(`${API_URL}/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          company: cleanValues.firm,
          contactName: cleanValues.name,
          email: cleanValues.email,
          phone: cleanValues.phone,
          requirements: cleanValues.bom,
          consent: form.consent,
        }),
      });
      const data = await res.json();
      recorded = res.ok && data.success;
      if (!recorded) {
        setErr(
          data.errors?.[0] ||
            "Couldn't save your request on our end — please still send it via WhatsApp below and we'll pick it up.",
        );
      }
    } catch {
      setErr(
        "Couldn't reach our server — please still send it via WhatsApp below and we'll pick it up.",
      );
    } finally {
      setSubmitting(false);
    }

    setSuccess(
      recorded
        ? "Quote request received! Opening WhatsApp to send it directly too…"
        : "Opening WhatsApp so you can send this directly…",
    );

    const msg = `Bulk Quote Request — Volamp\n\nName: ${cleanValues.name}\nFirm: ${cleanValues.firm}\nPhone: ${cleanValues.phone}\nEmail: ${cleanValues.email || "—"}\nSite: ${cleanValues.site || "—"}\n\nBOM / Requirement:\n${cleanValues.bom}`;
    window.open(
      buildWhatsAppUrl(VOLAMP_WA, msg),
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleFieldChange = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });
  const inputClass =
    "w-full rounded-lg border border-[color:var(--frame)] bg-background px-3 py-2 text-xs outline-none focus:border-[color:var(--orange)] font-medium";

  return (
    <>
      <PageHero
        eyebrow="For builders & procurement"
        title="Bulk quotes on India's leading brands."
        subtitle="Paste your BOM below or describe your requirement. We'll match brands, sizes and lead-time and reply with a quotation."
      />

      <Section className="max-w-3xl">
        <Eyebrow>Send BOM</Eyebrow>
        <H2>Get a quotation.</H2>
        <form
          onSubmit={submit}
          className="mt-6 grid gap-3.5 rounded-2xl border border-[color:var(--frame)]/40 bg-card p-5 md:p-7 shadow-xs"
        >
          <div className="grid gap-3.5 sm:grid-cols-2">
            <label className="grid gap-1 text-xs">
              <span className="font-bold text-foreground/70">Your name *</span>
              <input
                required
                maxLength={80}
                value={form.name}
                onChange={handleFieldChange("name")}
                className={inputClass}
              />
            </label>
            <label className="grid gap-1 text-xs">
              <span className="font-bold text-foreground/70">Firm *</span>
              <input
                required
                maxLength={120}
                value={form.firm}
                onChange={handleFieldChange("firm")}
                className={inputClass}
              />
            </label>
            <label className="grid gap-1 text-xs">
              <span className="font-bold text-foreground/70">Phone *</span>
              <input
                required
                type="tel"
                maxLength={20}
                value={form.phone}
                onChange={handleFieldChange("phone")}
                className={inputClass}
                placeholder="+91 …"
              />
            </label>
            <label className="grid gap-1 text-xs">
              <span className="font-bold text-foreground/70">Email *</span>
              <input
                required
                type="email"
                maxLength={254}
                value={form.email}
                onChange={handleFieldChange("email")}
                className={inputClass}
              />
            </label>
            <label className="grid gap-1 text-xs sm:col-span-2">
              <span className="font-bold text-foreground/70">
                Site / Project
              </span>
              <input
                maxLength={200}
                value={form.site}
                onChange={handleFieldChange("site")}
                className={inputClass}
                placeholder="Location or project name"
              />
            </label>
          </div>
          <label className="grid gap-1 text-xs">
            <span className="font-bold text-foreground/70">
              BOM / Requirement *
            </span>
            <textarea
              required
              rows={6}
              maxLength={1800}
              value={form.bom}
              onChange={handleFieldChange("bom")}
              className={inputClass}
              placeholder="Item name, brand (if fixed), size, quantity, delivery timeline…"
            />
          </label>
          <label className="flex items-start gap-2 text-[11px] font-medium text-foreground/70">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(e) =>
                setForm({ ...form, consent: e.target.checked })
              }
              className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-[color:var(--frame)]/40 accent-[color:var(--orange)]"
            />
            <span>
              I agree to the{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noreferrer"
                className="underline font-bold text-[color:var(--maroon)]"
              >
                Privacy Policy
              </a>{" "}
              and consent to Volamp Elektrikals contacting me about this
              request.
            </span>
          </label>
          {err && <p className="text-xs text-destructive font-medium">{err}</p>}
          {success && (
            <p className="text-xs text-emerald-600 font-bold">{success}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg brand-gradient px-4 py-2.5 text-xs font-bold text-white shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />{" "}
            {submitting ? "Sending…" : "Send bulk quote request"}
          </button>
        </form>
      </Section>
    </>
  );
}
