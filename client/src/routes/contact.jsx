import { useState } from "react";
import { Phone, MessageCircle, Mail, MapPin, Clock, Send } from "lucide-react";
import { PageHero, Section, Eyebrow, H2 } from "../components/site-bits";
import { Reveal } from "../components/reveal";
import { API_URL } from "../lib/api";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const formData = new FormData(e.target);
    const payload = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      division: formData.get("division"),
      message: formData.get("message"),
      consent: formData.get("consent") === "on",
    };

    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSent(true);
      } else {
        setErrorMsg(
          data.errors?.[0] ||
            "Something went wrong sending your enquiry. Please try again or call us directly.",
        );
      }
    } catch {
      setErrorMsg(
        "Couldn't reach the server. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's get you the right spec — fast."
        subtitle="Send us your requirement, or reach us directly on phone or WhatsApp. Our trade counter is set up to move you through fast."
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <div className="rounded-2xl border border-[color:var(--frame)]/40 bg-card p-5 md:p-7 shadow-xs">
              <Eyebrow>Request a Quote</Eyebrow>
              <h2 className="mt-1.5 font-display text-xl md:text-2xl font-bold text-[color:var(--maroon)]">
                Tell us what you need.
              </h2>
              {sent ? (
                <div className="mt-5 rounded-xl border border-[color:var(--orange)]/40 bg-[color:var(--orange)]/5 p-4 text-xs">
                  <p className="font-bold text-[color:var(--maroon)]">
                    Thank you — we've received your enquiry.
                  </p>
                  <p className="mt-1 text-foreground/70">
                    A member of our team will reply during business hours. For
                    urgent quotes, call{" "}
                    <a href="#" className="underline font-bold">
                      XX
                    </a>
                    .
                  </p>
                </div>
              ) : (
                <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
                  <Field label="Name" name="name" required />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Phone" name="phone" type="tel" required />
                    <Field label="Email" name="email" type="email" required />
                  </div>
                  <div className="grid gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/70 ml-0.5">
                      Product division
                    </label>
                    <select
                      name="division"
                      className="w-full rounded-lg border border-[color:var(--frame)]/40 bg-white px-3 py-2 text-xs font-medium text-foreground outline-none transition-all focus:border-[color:var(--orange)] focus:ring-2 focus:ring-[color:var(--orange)]/10"
                    >
                      <option>Wires & Cables</option>
                      <option>Switchgear & Accessories</option>
                      <option>Both</option>
                    </select>
                  </div>
                  <div className="grid gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/70 ml-0.5">
                      Your requirement
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      required
                      placeholder="Brands, sizes, quantities, delivery timeline…"
                      className="w-full rounded-lg border border-[color:var(--frame)]/40 bg-white px-3 py-2 text-xs font-medium text-foreground outline-none transition-all focus:border-[color:var(--orange)] focus:ring-2 focus:ring-[color:var(--orange)]/10 resize-none"
                    />
                  </div>
                  <label className="flex items-start gap-2 text-[11px] font-medium text-foreground/70">
                    <input
                      type="checkbox"
                      name="consent"
                      required
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
                      and consent to DemoVolt Electricals contacting me about
                      this enquiry.
                    </span>
                  </label>
                  {errorMsg && (
                    <p className="text-xs text-destructive">{errorMsg}</p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg brand-gradient px-4 py-2.5 text-xs font-bold text-white hover:opacity-95 disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    <Send className="h-3.5 w-3.5" />{" "}
                    {loading ? "Sending..." : "Send enquiry"}
                  </button>
                </form>
              )}
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="space-y-3">
            <ContactCard icon={Phone} title="Call">
              <a
                href="#"
                className="block hover:text-[color:var(--orange)] transition-colors"
              >
                XX
              </a>
              <a
                href="#"
                className="block hover:text-[color:var(--orange)] transition-colors"
              >
                XX
              </a>
            </ContactCard>
            <ContactCard icon={MessageCircle} title="WhatsApp">
              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[color:var(--orange)] transition-colors"
              >
                Chat with us on XX
              </a>
            </ContactCard>
            <ContactCard icon={Mail} title="Email">
              <a
                href="#"
                className="hover:text-[color:var(--orange)] transition-colors"
              >
                XX
              </a>
            </ContactCard>
            <ContactCard icon={MapPin} title="XX">
              <p>
                XX
              </p>
            </ContactCard>
            <ContactCard icon={MapPin} title="XX">
              <p>
                XX
              </p>
            </ContactCard>
            <ContactCard icon={Clock} title="Business hours">
              <p>
                Mon – Sat · 10:00 to 19:30{" "}
                <span className="text-muted-foreground text-[11px]">
                  (confirm with counter)
                </span>
              </p>
            </ContactCard>
          </div>
          </Reveal>
        </div>
      </Section>

      <div className="border-t bg-card">
        <Section className="!py-10">
          <Eyebrow>Find us</Eyebrow>
          <H2>Demo City.</H2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-[color:var(--frame)]/40 aspect-[16/7]">
            <iframe
              title="DemoVolt prototype map"
              src="https://www.google.com/maps?q=Demo+City&output=embed"
              width="100%"
              height="100%"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="border-0"
            />
          </div>
        </Section>
      </div>
    </>
  );
}

function Field({ label, name, type = "text", required }) {
  return (
    <div className="grid gap-1">
      <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/70 ml-0.5">
        {label}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        className="w-full rounded-lg border border-[color:var(--frame)]/40 bg-white px-3 py-2 text-xs font-medium text-foreground outline-none transition-all focus:border-[color:var(--orange)] focus:ring-2 focus:ring-[color:var(--orange)]/10"
      />
    </div>
  );
}

function ContactCard({ icon: Icon, title, children }) {
  return (
    <div className="card-lift flex gap-3.5 rounded-xl border border-[color:var(--frame)]/40 bg-card p-4 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="icon-badge shrink-0 rounded-lg brand-gradient p-2 h-8 w-8 flex items-center justify-center">
        <Icon className="icon-badge__glyph h-4 w-4 text-white" />
      </div>
      <div className="text-xs text-foreground/80">
        <p className="font-bold text-[color:var(--maroon)] text-xs">{title}</p>
        <div className="mt-0.5 space-y-0.5 font-medium">{children}</div>
      </div>
    </div>
  );
}
