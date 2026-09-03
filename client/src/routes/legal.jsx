import { PageHero, Section } from "../components/site-bits";

export default function Legal() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Legal & Compliance"
        subtitle="Company registration, GST and authorised-dealer information."
      />

      <Section className="!py-10 max-w-3xl">
        <dl className="grid gap-3.5 sm:grid-cols-2">
          {[
            ["Company", "DemoVolt Electricals (Prototype)"],
            [
              "Registered office",
              "XX",
            ],
            ["Warehouse", "XX"],
            ["GST / VAT", "Available on invoice"],
            ["Payment terms", "As agreed on quotation"],
            ["Grievance officer", "XX"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-[color:var(--frame)]/40 bg-card p-3.5 shadow-xs"
            >
              <dt className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--orange)]">
                {label}
              </dt>
              <dd className="mt-0.5 text-xs font-semibold text-foreground/80">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-xs text-foreground/70 leading-relaxed font-medium">
          DemoVolt Electricals is a fictional prototype distributor. All brands,
          registration details and supply claims shown here are sample data only.
        </p>
      </Section>
    </>
  );
}
