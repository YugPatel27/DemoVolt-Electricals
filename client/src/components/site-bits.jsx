import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";

// Animated counter hook for numbers
export function useAnimatedCounter(end, duration = 2000, isVisible = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const numericEnd = parseInt(String(end).replace(/\D/g, ""), 10) || 0;
    if (numericEnd === 0) return;

    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      const currentCount = Math.floor(easeProgress * numericEnd);
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(numericEnd);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, isVisible]);

  return count;
}

export function AnimatedNumber({ value, suffix = "" }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  const numericVal = parseInt(String(value).replace(/\D/g, ""), 10) || 0;
  const count = useAnimatedCounter(numericVal, 1600, isVisible);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const formatted =
    count.toLocaleString() + (String(value).includes("+") ? "+" : "") + suffix;

  return (
    <span ref={ref} className="inline-block transition-transform duration-300">
      {isVisible ? formatted : "0"}
    </span>
  );
}

export function Section({ children, className = "", id }) {
  return (
    <section
      id={id}
      className={`mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16 ${className}`}
    >
      {children}
    </section>
  );
}

export function Eyebrow({ children }) {
  return (
    <div
      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em]"
      style={{ color: "var(--orange)" }}
    >
      <span className="h-px w-6 brand-gradient animate-pulse" />
      {children}
    </div>
  );
}

export function H2({ children, className = "" }) {
  return (
    <h2
      className={`mt-2 font-display text-3xl md:text-5xl font-bold text-[color:var(--maroon)] tracking-tight leading-[1.08] ${className}`}
    >
      {children}
    </h2>
  );
}

export function PageHero({ eyebrow, title, subtitle }) {
  return (
    <div
      className="relative overflow-hidden border-b"
      style={{ backgroundColor: "#fbf7f0" }}
    >
      <div className="absolute inset-x-0 top-0 h-1 brand-gradient" />
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-20 brand-gradient blur-3xl animate-pulse" />

      <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16 relative">
        <Eyebrow>{eyebrow}</Eyebrow>

        <h1 className="mt-2.5 font-display text-4xl md:text-6xl font-bold text-[color:var(--maroon)] max-w-4xl tracking-tight leading-[1.08]">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-4 max-w-2xl text-sm md:text-base text-foreground/75 leading-relaxed font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export function BrandStrip() {
  const brands = [
    "Finolex",
    "KEI",
    "Polycab",
    "Bajaj",
    "Hager",
    "Schneider Electric",
    "Legrand",
    "L&T",
  ];

  // Duplicated so the track can loop seamlessly.
  const track = [...brands, ...brands];

  return (
    <div className="border-y bg-card overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Authorized distributor for India's leading electrical brands
        </p>

        <div className="relative mt-4 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
          <div className="marquee-track flex w-max items-center gap-2.5">
            {track.map((brand, i) => (
              <div
                key={`${brand}-${i}`}
                className="flex shrink-0 items-center justify-center rounded-lg border border-[color:var(--frame)]/40 bg-background px-5 py-2.5 text-xs font-bold text-[color:var(--maroon)] shadow-xs hover:border-[color:var(--orange)] hover:scale-105 hover:shadow-md transition-all duration-300 cursor-default"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CategoryCard({ title, href, brands }) {
  const inner = (
    <div className="group h-full rounded-lg border border-[color:var(--frame)]/40 bg-card p-4 transition-all duration-300 hover:border-[color:var(--orange)] hover:shadow-md hover:-translate-y-1">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-base font-bold text-[color:var(--maroon)]">
          {title}
        </h3>

        <ArrowRight className="h-4 w-4 text-[color:var(--orange)] opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
      </div>

      {brands && (
        <p className="mt-1.5 text-xs uppercase tracking-wider text-muted-foreground">
          {brands}
        </p>
      )}
    </div>
  );

  return href ? <Link to={href}>{inner}</Link> : inner;
}

export function BulletList({ items }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-2 text-sm text-foreground/80 font-medium group hover:translate-x-1 transition-transform duration-200"
        >
          <CheckCircle2
            className="h-4 w-4 shrink-0 mt-0.5 group-hover:scale-125 transition-transform duration-200"
            style={{ color: "var(--orange)" }}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function CtaBanner() {
  return (
    <div className="brand-gradient relative overflow-hidden">
      <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-white/10 blur-2xl animate-pulse" />
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-10 md:py-12 grid gap-6 md:grid-cols-[1.6fr_1fr] items-center relative z-10">
        <div className="text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
            Ready to power your project?
          </p>

          <h3 className="font-display text-2xl md:text-4xl font-bold mt-1.5 tracking-tight leading-snug">
            Get a quote on wires, cables & switchgear today.
          </h3>

          <p className="mt-1.5 text-xs md:text-sm text-white/90 max-w-xl leading-relaxed">
            Bulk pricing, verified brand-authentic stock, and delivery across
            Ahmedabad and Gujarat.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 md:justify-end">
          <a
            href="tel:+919512355502"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-bold text-[color:var(--maroon)] hover:bg-white/90 hover:scale-105 transition-all cursor-pointer shadow-sm"
          >
            Call +91 95123 55502
          </a>

          <a
            href="https://wa.me/919512355502"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-white/60 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10 hover:scale-105 transition-all cursor-pointer"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
