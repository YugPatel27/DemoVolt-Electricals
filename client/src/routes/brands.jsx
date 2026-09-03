import { Link } from "react-router-dom";
import { ExternalLink, Award } from "lucide-react";
import {
  PageHero,
  Section,
  Eyebrow,
  H2,
  CtaBanner,
} from "../components/site-bits";
import { Reveal } from "../components/reveal";
import { BRAND_INFO } from "../lib/catalog";
import { AnimatedLink } from "../components/animated-link";

const CABLES = ["DemoWire", "ArcLine", "BrightCore", "Circuita"];
const SWG = ["GridPro", "Lumenix", "VoltEdge", "SafeCurrent"];

function BrandCard({ name, to }) {
  const brandInfo = BRAND_INFO[name];
  const initials = name
    .replace(/[^A-Za-z& ]/g, "")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="group card-lift flex flex-col overflow-hidden rounded-2xl border border-[color:var(--frame)]/40 bg-white hover:-translate-y-0.5 hover:shadow-lg hover:border-[color:var(--orange)] h-full">
      <div className="flex h-40 items-center justify-center bg-gradient-to-br from-[color:var(--maroon)]/5 to-[color:var(--orange)]/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 brand-gradient" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-xl border-2 border-[color:var(--maroon)] bg-white text-2xl font-black text-[color:var(--maroon)] shadow-md">
          {initials}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-2">
          <h3 className="text-base font-black text-[color:var(--maroon)] tracking-tight leading-tight flex-1">
            {brandInfo.name}
          </h3>
          <span className="shrink-0 inline-flex items-center gap-1 rounded-md bg-[color:var(--orange)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[color:var(--orange)]">
            <Award className="h-3 w-3" /> Authorized
          </span>
        </div>
        <p className="mt-2 text-xs font-medium text-foreground/70 flex-1 line-clamp-3 min-h-[50px]">
          {brandInfo.blurb}
        </p>
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-[color:var(--frame)]/20">
          <AnimatedLink to={to} className="text-xs">
            Shop {brandInfo.division === "wires" ? "cables" : "switchgear"}
          </AnimatedLink>
          <a
            href={brandInfo.site}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-foreground/50 hover:text-[color:var(--maroon)] uppercase tracking-wider transition-colors"
          >
            Official <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Brands() {
  return (
    <>
      <PageHero
        eyebrow="Authorized Distributor"
        title="Fictional electrical brands, shown in the prototype."
        subtitle="DemoVolt Electricals uses eight invented wire, cable and switchgear brands to demonstrate the catalogue experience."
      />

      <Section>
        <Eyebrow>Wires & Cables</Eyebrow>
        <H2>Cables built for reliability.</H2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CABLES.map((brandName, i) => (
            <Reveal key={brandName} delay={i * 60}>
              <BrandCard name={brandName} to="/wires-cables" />
            </Reveal>
          ))}
        </div>
      </Section>

      <div className="border-t bg-card">
        <Section className="!py-12">
          <Eyebrow>Switchgear & Accessories</Eyebrow>
          <H2>Safety and control systems.</H2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SWG.map((brandName, i) => (
              <Reveal key={brandName} delay={i * 60}>
                <BrandCard name={brandName} to="/switchgear" />
              </Reveal>
            ))}
          </div>
        </Section>
      </div>

      <CtaBanner />
    </>
  );
}
