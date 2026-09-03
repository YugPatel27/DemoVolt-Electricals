import {
  PageHero,
  Section,
  Eyebrow,
  H2,
  CtaBanner,
} from "../components/site-bits";
import { Reveal } from "../components/reveal";

const PROJECTS = [
  {
    title: "Residential tower fit-out, West Ahmedabad",
    scope:
      "Housing wiring package — house wire, flexible cable, modular switches",
    tags: ["Cables", "Switchgear"],
  },
  {
    title: "SME factory panel-build, Aslali",
    scope: "Distribution boards, MCCBs and industrial sockets",
    tags: ["Switchgear"],
  },
  {
    title: "Commercial showroom, Khadia",
    scope: "Full electrical retrofit with modular wiring devices",
    tags: ["Cables", "Switchgear"],
  },
  {
    title: "Warehouse lighting, Sanand corridor",
    scope: "LT power cabling and DB replacement",
    tags: ["Cables"],
  },
  {
    title: "Retail chain rollout — Gujarat",
    scope: "Repeatable BOM of modular switches and DBs across sites",
    tags: ["Switchgear"],
  },
  {
    title: "Solar rooftop DC cabling",
    scope: "Solar DC cables and protection for a 200 kWp rooftop",
    tags: ["Cables"],
  },
];

export default function Projects() {
  return (
    <>
      <PageHero
        eyebrow="Projects"
        title="A snapshot of what we've supplied."
        subtitle="Representative project supplies from across Ahmedabad and Gujarat. Client names withheld until published permissions are in."
      />

      <Section>
        <Reveal>
          <Eyebrow>Recent supplies</Eyebrow>
          <H2>Cables, switchgear, or both.</H2>
        </Reveal>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((project, i) => (
            <Reveal key={project.title} delay={i * 60}>
              <article className="card-lift flex h-full flex-col rounded-2xl border border-[color:var(--frame)]/40 bg-card overflow-hidden shadow-xs hover:-translate-y-0.5 hover:shadow-lg">
                <div className="brand-gradient h-1.5" />
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-display text-base font-bold text-[color:var(--maroon)]">
                    {project.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-foreground/70 flex-1 leading-normal font-medium">
                    {project.scope}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[color:var(--orange)]/40 bg-[color:var(--orange)]/10 px-2.5 py-0.5 text-[10px] font-bold text-[color:var(--maroon)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>
      <CtaBanner />
    </>
  );
}
