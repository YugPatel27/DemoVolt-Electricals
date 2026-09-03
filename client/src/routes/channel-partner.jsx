import { useState } from "react";
import { Send } from "lucide-react";
import { PageHero, Section, Eyebrow, H2 } from "../components/site-bits";
import {
  isPhone,
  sanitize,
  buildWhatsAppUrl,
  VOLAMP_WA,
  isGSTIN,
} from "../lib/validate";

export default function ChannelPartner() {
  const [form, setForm] = useState({
    name: "",
    firm: "",
    gstin: "",
    city: "",
    phone: "",
    message: "",
  });
  const [err, setErr] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    const cleanValues = Object.fromEntries(
      Object.entries(form).map(([field, val]) => [field, sanitize(val, 200)]),
    );
    if (!cleanValues.name || !cleanValues.firm || !cleanValues.city)
      return setErr("Please fill name, firm and city.");
    if (!isPhone(cleanValues.phone))
      return setErr("Enter a valid phone number.");
    if (cleanValues.gstin && !isGSTIN(cleanValues.gstin))
      return setErr("Enter a valid GSTIN or leave it blank.");
    const msg = `Channel Partner Application — DemoVolt\n\nName: ${cleanValues.name}\nFirm: ${cleanValues.firm}\nGSTIN: ${cleanValues.gstin || "—"}\nCity: ${cleanValues.city}\nPhone: ${cleanValues.phone}\n\nMessage: ${cleanValues.message || "—"}`;
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
        eyebrow="Channel partner program"
        title="Stock demo brands. Explore the workflow."
        subtitle="Retailers and sub-dealers can test this fictional partner application with sample details."
      />

      <Section className="max-w-3xl">
        <Eyebrow>Apply</Eyebrow>
        <H2>Tell us about your firm.</H2>
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
              <span className="font-bold text-foreground/70">Firm name *</span>
              <input
                required
                maxLength={120}
                value={form.firm}
                onChange={handleFieldChange("firm")}
                className={inputClass}
              />
            </label>
            <label className="grid gap-1 text-xs">
              <span className="font-bold text-foreground/70">GSTIN</span>
              <input
                maxLength={20}
                value={form.gstin}
                onChange={handleFieldChange("gstin")}
                className={inputClass}
                placeholder="Optional"
              />
            </label>
            <label className="grid gap-1 text-xs">
              <span className="font-bold text-foreground/70">City *</span>
              <input
                required
                maxLength={60}
                value={form.city}
                onChange={handleFieldChange("city")}
                className={inputClass}
              />
            </label>
            <label className="grid gap-1 text-xs sm:col-span-2">
              <span className="font-bold text-foreground/70">Phone *</span>
              <input
                required
                type="tel"
                maxLength={20}
                value={form.phone}
                onChange={handleFieldChange("phone")}
                className={inputClass}
                placeholder="XX"
              />
            </label>
          </div>
          <label className="grid gap-1 text-xs">
            <span className="font-bold text-foreground/70">
              Brands you already carry / message
            </span>
            <textarea
              rows={4}
              maxLength={800}
              value={form.message}
              onChange={handleFieldChange("message")}
              className={inputClass}
            />
          </label>
          {err && <p className="text-xs text-destructive font-medium">{err}</p>}
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg brand-gradient px-4 py-2.5 text-xs font-bold text-white cursor-pointer shadow-sm"
          >
            <Send className="h-3.5 w-3.5" /> Send application via WhatsApp
          </button>
        </form>
      </Section>
    </>
  );
}
