import { PageHero, Section } from "../components/site-bits";

export default function Terms() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of Use"
        subtitle="This prototype uses fictional content and sample workflows."
      />

      <Section className="!py-10 max-w-3xl">
        <div className="space-y-4 text-xs text-foreground/75 leading-relaxed font-medium">
          <p>
            <strong className="text-[color:var(--maroon)]">Eligibility.</strong>{" "}
            This site and any account on it are intended for use by
            individuals aged 18 and above. By registering an account, you
            confirm that you are at least 18 years old; we validate this at
            the time of registration and cannot create an account for anyone
            who does not meet this requirement.
          </p>
          <p>
            <strong className="text-[color:var(--maroon)]">
              Account registration &amp; security.
            </strong>{" "}
            If you create an account, you are responsible for keeping your
            password confidential and for all activity that occurs under
            your account. Notify us immediately at{" "}
            <a
              href="#"
              className="underline text-[color:var(--orange)]"
            >
              XX
            </a>{" "}
            if you suspect unauthorised access. We may suspend or terminate
            an account that we reasonably believe is being used fraudulently,
            abusively, or in breach of these terms.
          </p>
          <p>
            <strong className="text-[color:var(--maroon)]">Content.</strong>{" "}
            Product images, specifications and brand names shown on this site
            are for reference only. Actual product supplied will conform to the
            manufacturer's current specification.
          </p>
          <p>
            <strong className="text-[color:var(--maroon)]">Enquiries.</strong>{" "}
            Prices and availability shared in response to an enquiry are
            indicative and subject to written confirmation. An enquiry is not an
            order until we confirm it in writing. Submitting a contact or
            bulk-quote form requires you to confirm you've read our{" "}
            <a href="/privacy" className="underline text-[color:var(--orange)]">
              Privacy Policy
            </a>
            .
          </p>
          <p>
            <strong className="text-[color:var(--maroon)]">Trademarks.</strong>{" "}
            Product names and brands shown in this prototype are fictional
            examples and do not represent real suppliers or endorsements.
          </p>
          <p>
            <strong className="text-[color:var(--maroon)]">Warranty.</strong>{" "}
            All products and warranty details shown are sample data only.
          </p>
          <p>
            <strong className="text-[color:var(--maroon)]">
              Acceptable use.
            </strong>{" "}
            Do not attempt to scrape, overload or misuse this site. Submitted
            form data must be truthful. You agree not to circumvent, disable,
            or otherwise interfere with any security-related features of the
            site, including rate limiting and account-lockout protections.
          </p>
          <p>
            <strong className="text-[color:var(--maroon)]">
              Availability &amp; changes to the service.
            </strong>{" "}
            We aim to keep this site available at all times but do not
            guarantee uninterrupted access. We may modify, suspend, or
            discontinue any part of the site or its features (including
            account functionality) at any time, with or without notice.
          </p>
          <p>
            <strong className="text-[color:var(--maroon)]">Liability.</strong>{" "}
            To the fullest extent permitted by law, DemoVolt Electricals'
            liability arising from use of this website is limited to the amount
            paid, if any, for the goods in question. We are not liable for
            indirect, incidental, or consequential loss arising from your use
            of the site.
          </p>
          <p>
            <strong className="text-[color:var(--maroon)]">Indemnity.</strong>{" "}
            You agree to indemnify DemoVolt Electricals against any claim or
            liability arising from your breach of these terms or your misuse
            of the site.
          </p>
          <p>
            <strong className="text-[color:var(--maroon)]">
              Governing law &amp; disputes.
            </strong>{" "}
            These prototype terms are not legal advice and do not establish a
            real-world jurisdiction or commercial relationship.
          </p>
          <p>
            <strong className="text-[color:var(--maroon)]">Severability.</strong>{" "}
            If any provision of these terms is found unenforceable, the
            remaining provisions continue in full force.
          </p>
          <p>
            <strong className="text-[color:var(--maroon)]">
              Changes to these terms.
            </strong>{" "}
            We may update these terms from time to time; continued use of the
            site after an update constitutes acceptance of the revised terms.
          </p>
          <p>
            <strong className="text-[color:var(--maroon)]">
              Grievances.
            </strong>{" "}
            For any complaint about this site or these terms, contact our
            Grievance Officer as listed on the{" "}
            <a href="/privacy" className="underline text-[color:var(--orange)]">
              Privacy Policy
            </a>{" "}
            page.
          </p>
        </div>
      </Section>
    </>
  );
}
