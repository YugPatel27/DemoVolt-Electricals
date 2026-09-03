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
        eyebrow="About Volamp"
        title="Powering Ahmedabad's electrical trade, one project at a time."
        subtitle="Volamp Elektrikals Private Limited is a full-range distributor of electrical wires, cables, switchgear and accessories, serving contractors, builders, industry and retailers across Gujarat."
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] items-center">
          <div className="order-2 lg:order-1">
            <Eyebrow>Our story</Eyebrow>
            <H2>A trade counter that grew into a full-range distributor.</H2>
            <p className="mt-3 text-xs md:text-sm text-foreground/75 leading-relaxed font-medium">
              Volamp began at a modest counter on Sir Chinubhai Road in Khadia,
              serving Ahmedabad's electricians with the wires and switches they
              needed, the same day they needed them. Over the years, that trade
              counter grew — first into a full-range wires & cables distributor
              with Finolex, KEI, Polycab and Bajaj, and then into a serious
              switchgear house with Hager, Schneider Electric, Legrand and L&T.
            </p>
            <p className="mt-2.5 text-xs md:text-sm text-foreground/75 leading-relaxed font-medium">
              Today we operate from two locations — the original Khadia counter
              and a fulfilment warehouse in Aslali — supporting projects across
              Gujarat with authentic, brand-authorised stock.
            </p>
          </div>
          <div className="order-1 lg:order-2 overflow-hidden rounded-2xl border border-[color:var(--frame)]/40 shadow-md">
            <img
              src={storefrontImg}
              alt="Interior of Volamp Elektrikals showroom"
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
                To be Ahmedabad's most reliable single source for wires, cables
                and switchgear — with the range, the paperwork and the
                counter-team to back it up.
              </p>
            </div>
            <div>
              <Eyebrow>Vision</Eyebrow>
              <p className="mt-2.5 font-display text-xl md:text-2xl text-[color:var(--maroon)] italic leading-snug">
                A Gujarat where every electrical contractor and project can
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
              "Authorised dealer relationships with 8 of India's leading electrical brands",
              "Two Ahmedabad locations — a Khadia counter and an Aslali warehouse",
              "Both product divisions in depth — cables AND switchgear, never one as an afterthought",
              "Direct-from-brand sourcing with invoices and warranty on request",
              "Same-day dispatch within Ahmedabad; next-day across Gujarat on in-stock lines",
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
