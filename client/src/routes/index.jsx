import { Link } from "react-router-dom";
import { Phone } from "lucide-react";
import heroImg from "../assets/hero-warehouse.jpg";
import wiresImg from "../assets/wires-cables.jpg";
import switchgearImg from "../assets/switchgear.jpg";
import {
  Section,
  Eyebrow,
  H2,
  BrandStrip,
  BulletList,
  CtaBanner,
} from "../components/site-bits";
import { Reveal } from "../components/reveal";
import { CustomerSegments } from "../components/customer-segments";
import { AnimatedLink } from "../components/animated-link";

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section
        className="relative overflow-hidden border-b"
        style={{ backgroundColor: "#fbf7f0" }}
      >
        <div className="absolute inset-x-0 top-0 h-1 brand-gradient" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full opacity-20 brand-gradient blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-8 px-4 md:px-6 py-12 md:py-20 lg:grid-cols-[1.05fr_1fr] items-center relative">
          <div
            className="animate-fade-up"
            style={{ animationDuration: "800ms" }}
          >
            <Eyebrow>Demo City · Prototype distributor</Eyebrow>
            <h1 className="mt-3 font-display text-4xl md:text-6xl font-bold text-[color:var(--maroon)] leading-[1.05] tracking-tight">
              Wires, cables & switchgear —{" "}
              <span className="brand-text-gradient">
                from fictional demo brands.
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-sm md:text-base text-foreground/75 leading-relaxed font-medium">
              DemoVolt Electricals is a fictional full-range distributor of
              DemoWire, ArcLine, BrightCore and Circuita wires & cables plus
              GridPro, Lumenix, VoltEdge and SafeCurrent switchgear. Prototype
              stock, sample pricing and one-tap contact.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-lg brand-gradient px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-95 transition-opacity"
              >
                Request a Quote
              </Link>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--maroon)] px-4 py-2.5 text-xs font-bold text-[color:var(--maroon)] hover:bg-[color:var(--maroon)]/5 transition-colors"
              >
                <Phone className="h-3.5 w-3.5" /> Call XX
              </a>
            </div>
            <dl className="mt-8 grid grid-cols-3 gap-4 max-w-md">
              {[
                { value: "8", label: "Brand partners" },
                { value: "2,000+", label: "SKUs stocked" },
                { value: "2", label: "Demo locations" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="font-display text-3xl font-bold text-[color:var(--maroon)]">
                    {stat.value}
                  </dt>
                  <dd className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div
            className="relative lg:h-full lg:min-h-[420px] animate-fade-up"
            style={{
              animationDuration: "800ms",
              animationDelay: "200ms",
              animationFillMode: "both",
            }}
          >
            <div className="absolute -inset-3 brand-gradient rounded-3xl opacity-30 blur-2xl animate-pulse" />
            <div className="relative h-full grid grid-cols-2 grid-rows-[1.2fr_1fr] gap-3">
              <div className="col-span-2 overflow-hidden rounded-2xl border border-[color:var(--frame)]/60 bg-white shadow-xl relative group">
                <img
                  src={heroImg}
                  alt="DemoVolt warehouse"
                  className="w-full h-full object-cover aspect-[21/9] lg:absolute lg:inset-0 transition-transform duration-700 group-hover:scale-105"
                  fetchpriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-lg font-display font-bold text-white tracking-wide">
                    Demo City Warehouse
                  </h3>
                  <p className="text-white/80 text-xs mt-0.5">
                    Deep inventory. Fast dispatch.
                  </p>
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl border border-[color:var(--frame)]/60 bg-white p-4 flex flex-col justify-between shadow-xl relative group">
                <div>
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-[color:var(--maroon)]">
                    100%
                  </h3>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground mt-1 font-bold leading-tight">
                    Authentic
                    <br />
                    Stock
                  </p>
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl border border-[color:var(--frame)]/60 shadow-xl relative group bg-[color:var(--maroon)]">
                <img
                  src={switchgearImg}
                  alt="Switchgear"
                  className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-100"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div
        className="animate-fade-in"
        style={{ animationDelay: "400ms", animationFillMode: "both" }}
      >
        <BrandStrip />
      </div>

      {/* CUSTOMER SEGMENTS */}
      <Section
        className="animate-fade-up"
        style={{ animationDelay: "600ms", animationFillMode: "both" }}
      >
        <Reveal>
          <div className="max-w-2xl">
            <Eyebrow>Who we serve</Eyebrow>
            <H2>Built for the people who build.</H2>
            <p className="mt-2 text-sm text-foreground/70 font-medium">
              Pick the path that fits — every route is optimised for how you
              actually order.
            </p>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="mt-8">
            <CustomerSegments />
          </div>
        </Reveal>
      </Section>

      {/* TWO DIVISIONS */}
      <div className="border-t bg-card">
        <Section>
          <Reveal>
            <div className="max-w-2xl">
              <Eyebrow>Two divisions, equally strong</Eyebrow>
              <H2>Everything for a complete electrical fit-out.</H2>
              <p className="mt-2 text-sm text-foreground/70 font-medium">
                From the first metre of cable to the final modular switch — we
                stock both product divisions in depth.
              </p>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <DivisionCard
              img={wiresImg}
              eyebrow="Division 01"
              title="Wires & Cables"
              brands="DemoWire · ArcLine · BrightCore · Circuita"
              copy="House wire, flexible, armoured, submersible, solar DC, LAN, coaxial, welding cables and more."
              to="/wires-cables"
            />

            <DivisionCard
              img={switchgearImg}
              eyebrow="Division 02"
              title="Switchgear & Accessories"
              brands="GridPro · Lumenix · VoltEdge · SafeCurrent"
              copy="MCBs, MCCBs, RCCBs, distribution boards, isolators, contactors and modular wiring devices."
              to="/switchgear"
            />
          </div>
        </Section>
      </div>

      {/* NOTE / QUOTE */}
      <div className="border-t bg-card">
        <Section>
          <div className="grid gap-8 lg:grid-cols-2 items-start">
            <Reveal>
              <div>
                <Eyebrow>Who we serve</Eyebrow>
                <H2>Demo City's electrical trade counter.</H2>
                <p className="mt-3 text-sm text-foreground/70 leading-relaxed font-medium">
                  Whether you're wiring a single flat or a factory, our counter
                  is set up to move you through fast — with the right SKU, the
                  right rating, and the right paperwork.
                </p>
                <div className="mt-5">
                  <BulletList
                    items={[
                      "Electrical contractors & site electricians",
                      "Builders, developers & procurement teams",
                      "Retailers & sub-dealers looking for wholesale supply",
                      "Industrial buyers for MRO and panel-build",
                    ]}
                  />
                </div>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="rounded-2xl border border-[color:var(--frame)]/40 bg-white p-6 md:p-8 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--orange)]">
                  A note from our team
                </p>
                <blockquote className="mt-2 font-display text-lg md:text-xl text-[color:var(--maroon)] leading-snug">
                  "This prototype shows how a trade counter could present a
                  useful range of products. Explore a spec, submit a sample
                  request, and test the ordering flow."
                </blockquote>
                <p className="mt-3 text-xs font-semibold text-muted-foreground">
                  — DemoVolt Prototype Team
                </p>
                <div className="mt-5 flex items-center gap-4 pt-3 border-t border-[color:var(--frame)]/20">
                  <AnimatedLink to="/about" className="text-xs">
                    About DemoVolt
                  </AnimatedLink>
                  <AnimatedLink
                    to="https://example.com/demo-catalogue"
                    external
                    className="text-xs"
                  >
                    View catalogue
                  </AnimatedLink>
                </div>
              </div>
            </Reveal>
          </div>
        </Section>
      </div>

      <CtaBanner />
    </>
  );
}

function DivisionCard({ img, eyebrow, title, brands, copy, to }) {
  return (
    <div className="group card-lift overflow-hidden rounded-2xl border border-[color:var(--frame)]/40 bg-white transition-all hover:shadow-lg hover:border-[color:var(--orange)] hover:-translate-y-0.5">
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={img}
          alt={title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--maroon)]/70 via-transparent to-transparent" />
        <span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold text-[color:var(--maroon)]">
          {eyebrow}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-xl font-bold text-[color:var(--maroon)]">
          {title}
        </h3>
        <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-[color:var(--orange)] font-bold">
          {brands}
        </p>
        <p className="mt-2 text-xs text-foreground/70 leading-relaxed font-medium">
          {copy}
        </p>
        <div className="mt-4">
          <AnimatedLink to={to} className="text-xs">
            Explore range
          </AnimatedLink>
        </div>
      </div>
    </div>
  );
}
