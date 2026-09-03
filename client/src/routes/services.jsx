import { Wrench, ShieldCheck, Cable, Plug, Zap } from "lucide-react";
import { PageHero, Section, CtaBanner } from "../components/site-bits";
import { Reveal } from "../components/reveal";

const SERVICES = [
  {
    icon: Wrench,
    title: "Repairs & Upgrades",
    desc: "Diagnostics and upgrades for existing installations — from a single circuit to a full DB rework.",
  },
  {
    icon: ShieldCheck,
    title: "Safety Inspections",
    desc: "Independent inspection of wiring, earthing and protection devices, with a clear report and priorities.",
  },
  {
    icon: Cable,
    title: "Wiring & Installation",
    desc: "Fresh wiring for residential, commercial and light-industrial fit-outs, using brand-authentic cable.",
  },
  {
    icon: Plug,
    title: "Outlet Installation",
    desc: "Modular switch, socket and outlet installation matched to your interior spec.",
  },
  {
    icon: Zap,
    title: "Electrical Maintenance",
    desc: "Scheduled and on-call maintenance for offices, retail, warehouses and light industry.",
  },
];

export default function Services() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Beyond supply — services that keep sites moving."
        subtitle="Our trade counter is backed by a small services team for projects that need more than just goods across the counter."
      />

      <Section>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, i) => (
            <Reveal key={service.title} delay={i * 70}>
              <div className="group card-lift rounded-2xl border border-[color:var(--frame)]/40 bg-card p-5 shadow-xs hover:-translate-y-0.5 hover:shadow-lg h-full">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[color:var(--orange)]/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                  <service.icon
                    className="h-6 w-6"
                    style={{ color: "var(--orange)" }}
                  />
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-[color:var(--maroon)]">
                  {service.title}
                </h3>
                <p className="mt-1.5 text-xs text-foreground/70 leading-relaxed font-medium">
                  {service.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={SERVICES.length * 70}>
          <div className="mt-8 rounded-xl border border-dashed border-[color:var(--frame)] bg-secondary/50 p-4 text-xs text-foreground/70 font-medium">
            <span className="font-bold text-[color:var(--maroon)]">Note:</span>{" "}
            Service scope varies by project. Please contact us with your
            requirement — we'll confirm what we can take on directly and where
            we'd bring in a trusted partner.
          </div>
        </Reveal>
      </Section>
      <CtaBanner />
    </>
  );
}
