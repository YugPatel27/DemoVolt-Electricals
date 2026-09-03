import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import heroImg from "../assets/hero-warehouse.jpg";
import { AnimatedLink } from "./animated-link";

const KEY = "volamp.welcome.seen";

export function WelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch (e) {
      /* ignore */
    }

    if (seen) return;
    const timerId = setTimeout(() => setOpen(true), 5000);
    return () => clearTimeout(timerId);
  }, []);

  const close = () => {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch (e) {
      /* ignore */
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <button
        aria-label="Close overlay"
        onClick={close}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-fade-up">
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-1.5 text-foreground shadow hover:bg-white cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid md:grid-cols-2">
          <div className="relative min-h-[180px] md:min-h-full">
            <img
              src={heroImg}
              alt="DemoVolt warehouse"
              className="h-full w-full object-cover"
              loading="eager"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[color:var(--maroon)]/60 to-transparent" />
          </div>

          <div className="p-5 md:p-6 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--orange)]">
                Welcome to DemoVolt
              </p>

              <h2 className="mt-1.5 font-display text-2xl font-bold text-[color:var(--maroon)] leading-snug">
                Powering fictional projects across Demo City.
              </h2>

              <p className="mt-2 text-xs text-foreground/75 leading-relaxed">
                DemoVolt Electricals is a fictional prototype distributor in Demo City
                distributor of eight leading electrical brands. We supply
                contractors, builders, and retailers.
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <Stat value="8" label="Brands" />
                <Stat value="2,000+" label="SKUs" />
                <Stat value="2" label="Locations" />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between pt-3 border-t border-[color:var(--frame)]/20">
              <Link
                to="/contact"
                onClick={close}
                className="inline-flex items-center gap-1.5 rounded-lg brand-gradient px-4 py-2 text-xs font-bold text-white shadow-sm"
              >
                Get a quote
              </Link>
              <div onClick={close}>
                <AnimatedLink to="/about" className="text-xs">
                  About us
                </AnimatedLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="rounded-lg border border-[color:var(--frame)]/40 py-1.5 bg-background">
      <div className="font-display text-base font-bold text-[color:var(--maroon)]">
        {value}
      </div>
      <div className="text-[9px] font-bold uppercase tracking-wider text-foreground/60">
        {label}
      </div>
    </div>
  );
}
