import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Zap, Send } from "lucide-react";
import {
  isPhone,
  sanitize,
  buildWhatsAppUrl,
  VOLAMP_WA,
} from "../lib/validate";

export function QuickOrderButton({ className = "" }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-md border border-[color:var(--orange)] px-3 py-2 text-sm font-semibold text-[color:var(--maroon)] hover:bg-[color:var(--orange)]/10 transition-colors ${className}`}
      >
        <Zap className="h-4 w-4" style={{ color: "var(--orange)" }} />
        Quick Order
      </button>

      {open &&
        createPortal(<Modal onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}

function Modal({ onClose }) {
  const [product, setProduct] = useState("");
  const [size, setSize] = useState("");
  const [meters, setMeters] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const submit = (e) => {
    e.preventDefault();

    const cleanProduct = sanitize(product, 120);
    const cleanSize = sanitize(size, 60);
    const cleanMeters = sanitize(meters, 40);
    const cleanName = sanitize(name, 80);
    const cleanPhone = sanitize(phone, 20);

    if (!cleanProduct) return setErr("Enter a product name.");
    if (!cleanMeters) return setErr("Enter meters / quantity.");
    if (!cleanName) return setErr("Enter your name.");
    if (!isPhone(cleanPhone)) return setErr("Enter a valid phone number.");

    const msg = `Quick Order — DemoVolt\n\nProduct: ${cleanProduct}\nSize / Gauge: ${cleanSize || "—"}\nMeters / Qty: ${cleanMeters}\n\nFrom: ${cleanName}\nPhone: ${cleanPhone}`;

    window.open(
      buildWhatsAppUrl(VOLAMP_WA, msg),
      "_blank",
      "noopener,noreferrer",
    );

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto p-4 sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <button
        aria-label="Close"
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      />

      <div className="relative my-auto w-full max-w-[480px] max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl bg-white/95 backdrop-blur-md shadow-2xl animate-fade-up ring-1 ring-black/5">
        <div className="relative p-6 sm:p-8">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full p-2 text-foreground/50 hover:bg-black/5 hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full brand-gradient shadow-lg shadow-[color:var(--orange)]/20">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold text-[color:var(--maroon)]">
                Quick Order
              </h3>
              <p className="text-sm text-foreground/60 mt-0.5">
                Skip the cart. Send a direct request.
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="grid gap-4">
            <FormField
              label="Product / Wire name"
              value={product}
              onChange={setProduct}
              placeholder="e.g. DemoWire House Wire 2.5 sqmm"
              maxLength={120}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Size / Gauge"
                value={size}
                onChange={setSize}
                placeholder="2.5 sqmm"
                maxLength={60}
              />

              <FormField
                label="Meters / Qty"
                value={meters}
                onChange={setMeters}
                placeholder="500 m"
                maxLength={40}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-black/5 mt-2">
              <FormField
                label="Your name"
                value={name}
                onChange={setName}
                placeholder="John Doe"
                maxLength={80}
                required
              />

              <FormField
                label="Phone"
                value={phone}
                onChange={setPhone}
                type="tel"
                placeholder="XX"
                maxLength={20}
                required
              />
            </div>

            {err && (
              <p className="text-xs font-medium text-red-600 px-1">{err}</p>
            )}

            <button
              type="submit"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl brand-gradient px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[color:var(--orange)]/20 transition-transform hover:-translate-y-0.5"
            >
              <Send className="h-4 w-4" />
              Send via WhatsApp
            </button>

            <p className="text-center text-[10px] font-semibold uppercase tracking-widest text-foreground/40 mt-2">
              Fast · Direct · Human
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  maxLength,
  required,
}) {
  return (
    <label className="group grid gap-1.5 text-sm relative">
      <span className="text-xs font-semibold uppercase tracking-wider text-foreground/60 group-focus-within:text-[color:var(--orange)] transition-colors ml-1">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        className="w-full rounded-xl border border-[color:var(--frame)]/60 bg-white px-4 py-2.5 text-sm outline-none focus:border-[color:var(--orange)] focus:ring-2 focus:ring-[color:var(--orange)]/20 transition-all shadow-sm focus:shadow-md font-semibold text-[color:var(--maroon)]"
      />
    </label>
  );
}
