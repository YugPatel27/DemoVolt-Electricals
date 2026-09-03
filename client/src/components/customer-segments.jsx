import { Link } from "react-router-dom";
import { Hammer, Building2, Handshake, RotateCcw } from "lucide-react";
import { AnimatedLink } from "./animated-link";

const SEGMENTS = [
  {
    icon: Hammer,
    title: "Electricians & Contractors",
    desc: "Fast lookup by spec, one-tap call / WhatsApp, verified stock.",
    to: "/wires-cables",
    cta: "Browse cables",
  },
  {
    icon: Building2,
    title: "Builders & Procurement",
    desc: "Full range across cables & switchgear, brand authenticity, bulk quote.",
    to: "/bulk-quote",
    cta: "Bulk quote",
  },
  {
    icon: Handshake,
    title: "Retailers & Sub-dealers",
    desc: "Wholesale terms, brand range, easy channel-partner path.",
    to: "/channel-partner",
    cta: "Become a partner",
  },
  {
    icon: RotateCcw,
    title: "Existing Customers",
    desc: "Fast reorder, your known Volamp contact, service requests.",
    to: "/contact",
    cta: "Reorder / support",
  },
];

export function CustomerSegments() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {SEGMENTS.map((segment) => (
        <div
          key={segment.title}
          className="group card-lift flex flex-col rounded-xl border border-[color:var(--frame)]/40 bg-card p-4 hover:border-[color:var(--orange)] hover:-translate-y-0.5 hover:shadow-lg"
        >
          <segment.icon
            className="h-6 w-6"
            style={{ color: "var(--orange)" }}
          />
          <h3 className="mt-2.5 font-display text-base font-bold text-[color:var(--maroon)]">
            {segment.title}
          </h3>
          <p className="mt-1 text-xs text-foreground/70 flex-1 leading-normal">
            {segment.desc}
          </p>
          <div className="mt-3 pt-2">
            <AnimatedLink to={segment.to} className="text-xs">
              {segment.cta}
            </AnimatedLink>
          </div>
        </div>
      ))}
    </div>
  );
}
