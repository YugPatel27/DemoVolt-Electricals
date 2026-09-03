// Small input validation + sanitisation helpers used across all forms.

export function sanitize(input, max = 500) {
  if (!input || typeof input !== "string") return "";
  return (
    input
      .replace(/<[^>]*>/g, "")
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u001F\u007F]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, max)
  );
}

export const isPhone = (v) =>
  typeof v === "string" && /^\+?\d[\d\s-]{8,15}$/.test(v.trim());
export const isEmail = (v) =>
  typeof v === "string" &&
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) &&
  v.length <= 254;
export const isGSTIN = (v) =>
  typeof v === "string" &&
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
    v.trim().toUpperCase(),
  );

export function buildWhatsAppUrl(phone, message) {
  const clean = phone.replace(/\D/g, "");
  const text = encodeURIComponent(sanitize(message, 1800));
  return `https://wa.me/${clean}?text=${text}`;
}

export const VOLAMP_WA = "919512355502";
