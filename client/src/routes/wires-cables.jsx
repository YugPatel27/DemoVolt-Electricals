import wiresImg from "../assets/wires-cables.jpg";
import {
  PageHero,
  Section,
  Eyebrow,
  H2,
  CtaBanner,
} from "../components/site-bits";
import { Reveal } from "../components/reveal";
import { ProductListing } from "../components/product-listing";
import { CABLE_PRODUCTS, CABLE_BRANDS, CABLE_GROUPS } from "../lib/catalog";

export default function WiresCables() {
  return (
    <>
      <PageHero
        eyebrow="Division 01 — Wires & Cables"
        title="Every metre, every gauge — shown in the demo catalogue."
        subtitle="From single-core house wire to armoured, solar and communication cables — all products and suppliers are fictional sample data."
      />

      <Section className="border-t bg-card">
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            {
              title: "House & building cables",
              copy: "Single-core, armoured and flexible wiring for residential and commercial installs.",
            },
            {
              title: "Solar & submersible",
              copy: "UV-rated DC, pump and solar DC cables ready for site use.",
            },
            {
              title: "Data & control",
              copy: "LAN, coaxial and instrumentation cables for modern panels and automation.",
            },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 80}>
              <div className="card-lift rounded-2xl border border-[color:var(--frame)]/40 bg-white p-5 hover:-translate-y-0.5 hover:shadow-lg h-full">
                <h3 className="font-display text-lg font-bold text-[color:var(--maroon)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs text-foreground/70 leading-relaxed font-medium">
                  {item.copy}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <Reveal>
          <Eyebrow>Full-range catalogue</Eyebrow>
          <H2>Filter, pick, add to enquiry.</H2>
          <p className="mt-2 max-w-2xl text-xs md:text-sm text-foreground/70 font-medium">
            Browse the full cable range. Tap "Add to Enquiry" on anything you
            need — we'll send you the matching brands, sizes and lead-time.
          </p>
        </Reveal>
        <div className="mt-6">
          <ProductListing
            products={CABLE_PRODUCTS}
            brands={CABLE_BRANDS}
            groups={CABLE_GROUPS}
            image={wiresImg}
          />
        </div>
      </Section>
      <CtaBanner />
    </>
  );
}
