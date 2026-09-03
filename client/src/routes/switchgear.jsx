import switchgearImg from "../assets/switchgear.jpg";
import {
  PageHero,
  Section,
  Eyebrow,
  H2,
  CtaBanner,
} from "../components/site-bits";
import { Reveal } from "../components/reveal";
import { ProductListing } from "../components/product-listing";
import { SWITCHGEAR_PRODUCTS, SWITCHGEAR_BRANDS } from "../lib/catalog";

const SG_GROUPS = [
  "Protection",
  "Distribution",
  "Control",
  "Modular & Industrial",
];

export default function Switchgear() {
  return (
    <>
      <PageHero
        eyebrow="Division 02 — Switchgear & Accessories"
        title="Protection, distribution and control — from trusted brands."
        subtitle="A full-range switchgear counter with MCBs, MCCBs, RCCBs, DBs, contactors, industrial sockets and modular wiring devices from Hager, Schneider Electric, Legrand and L&T."
      />

      <Section className="border-t bg-card">
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            {
              title: "Protection gear",
              copy: "MCBs, MCCBs and RCCBs for circuits that need reliable fault protection.",
            },
            {
              title: "Distribution boards",
              copy: "DBs, busbar systems and modular panels for clean, code-compliant installs.",
            },
            {
              title: "Control & accessories",
              copy: "Contactors, isolators, sockets and wiring devices for every build.",
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
          <Eyebrow>Everything a panel needs</Eyebrow>
          <H2>Filter, pick, add to enquiry.</H2>
          <p className="mt-2 max-w-2xl text-xs md:text-sm text-foreground/70 font-medium">
            The core switchgear range. Add anything to your enquiry and share
            your BOM — we'll quote back with matched brand, breaking capacity
            and part numbers.
          </p>
        </Reveal>
        <div className="mt-6">
          <ProductListing
            products={SWITCHGEAR_PRODUCTS}
            brands={SWITCHGEAR_BRANDS}
            groups={SG_GROUPS}
            image={switchgearImg}
          />
        </div>
      </Section>
      <CtaBanner />
    </>
  );
}
