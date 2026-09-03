import storefrontImg from "../assets/storefront.jpg";
import {
  Section,
  Eyebrow,
  H2,
  BulletList,
  CtaBanner,
  BrandStrip,
  PageHero,
} from "../components/site-bits";

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About DemoVolt"
        title="Powering Demo City's electrical trade, one prototype at a time."
        subtitle="DemoVolt Electricals is a fictional full-range distributor of electrical wires, cables, switchgear and accessories for this prototype website."
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] items-center">
          <div className="order-2 lg:order-1">
            <Eyebrow>Our story</Eyebrow>
            <H2>A trade counter that grew into a full-range distributor.</H2>
            <p className="mt-3 text-xs md:text-sm text-foreground/75 leading-relaxed font-medium">
              DemoVolt began as a fictional trade counter in Demo City, created
              to demonstrate a catalogue and enquiry experience. Its sample
              range includes DemoWire, ArcLine, BrightCore and Circuita cables,
              alongside GridPro, Lumenix, VoltEdge and SafeCurrent switchgear.
            </p>
            <p className="mt-2.5 text-xs md:text-sm text-foreground/75 leading-relaxed font-medium">
              The prototype presents two fictional locations and sample stock
              flows for contractors, builders, industry and retailers.
            </p>
          </div>
          <div className="order-1 lg:order-2 overflow-hidden rounded-2xl border border-[color:var(--frame)]/40 shadow-md">
            <img
              src={storefrontImg}
              alt="Interior of DemoVolt showroom"
              loading="lazy"
              className="w-full aspect-[16/10] object-cover"
            />
          </div>
        </div>
      </Section>

      <div className="border-y bg-card">
        <Section className="!py-12">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <Eyebrow>Mission</Eyebrow>
              <p className="mt-2.5 font-display text-xl md:text-2xl text-[color:var(--maroon)] italic leading-snug">
                To be Demo City's most reliable fictional source for wires, cables
                and switchgear — with the range, the paperwork and the
                counter-team to back it up.
              </p>
            </div>
            <div>
              <Eyebrow>Vision</Eyebrow>
              <p className="mt-2.5 font-display text-xl md:text-2xl text-[color:var(--maroon)] italic leading-snug">
                A demo region where every electrical contractor and project can
                count on brand-authentic supply, on time, at fair trade prices.
              </p>
            </div>
          </div>
        </Section>
      </div>

      <Section>
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <Eyebrow>What sets us apart</Eyebrow>
            <H2>Range, authenticity, and a team that answers the phone.</H2>
          </div>
          <BulletList
            items={[
              "Sample dealer relationships with 8 fictional electrical brands",
              "Two Demo City locations — a trade counter and a sample warehouse",
              "Both product divisions in depth — cables AND switchgear, never one as an afterthought",
              "Direct-from-brand sourcing with invoices and warranty on request",
              "Sample dispatch timelines for local and regional prototype orders",
              "Volume pricing for contractors, builders and sub-dealers",
            ]}
          />
        </div>
      </Section>

      <BrandStrip />
      <CtaBanner />
    </>
  );
}
