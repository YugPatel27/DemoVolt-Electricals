import { PageHero, Section } from "../components/site-bits";

export default function Privacy() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="Last updated: 26 July 2026. This policy explains how Volamp Elektrikals Private Limited collects and uses your information."
      />

      <Section className="!py-10 max-w-3xl">
        <Prose>
          <p>
            This policy is written to comply with India's Digital Personal
            Data Protection Act, 2023 ("DPDP Act") and applies to
            volampelektrikals.com and any account you create with us.
          </p>

          <h2>Who we are</h2>
          <p>
            Volamp Elektrikals Private Limited ("we", "us") is the data
            fiduciary for the personal data described below. Our contact
            details are at the bottom of this page.
          </p>

          <h2>What we collect, and why</h2>
          <p>
            We only collect what a given feature actually needs. Here's the
            breakdown by feature, not a blanket list:
          </p>
          <ul>
            <li>
              <strong>Contact &amp; bulk-quote forms</strong> — name, phone,
              email, and (for bulk quotes) company name and GSTIN. GSTIN is
              collected only to prepare accurate quotes and invoices for
              registered businesses; it is never used for any other purpose.
              We ask you to explicitly confirm you've read this policy before
              either form can be submitted.
            </li>
            <li>
              <strong>Account registration</strong> — name, email, age
              (we require 18+ to hold an account — see "Eligibility" below),
              and optionally a phone number. Your password is never stored in
              plain text; we store a salted bcrypt hash of it, not the
              password itself.
            </li>
            <li>
              <strong>Cart</strong> — the products and quantities you add,
              tied to your account, so your cart persists between visits.
            </li>
            <li>
              <strong>Account security data</strong> — sign-in timestamps and
              the IP address a session was created from. This exists solely
              to protect your account (detecting suspicious logins, powering
              "sign out of all devices") — it is not used to track your
              browsing or build a profile of your activity on the site.
            </li>
          </ul>
          <p>
            We do not collect anything passively beyond the above — no
            tracking pixels, no third-party analytics scripts are active on
            this site today. If that changes, this policy and our cookie
            banner will be updated first, and any new tracking will only run
            for visitors who've actively consented to it.
          </p>

          <h2>Eligibility</h2>
          <p>
            You must be at least 18 years old to register for an account on
            this site. We do not knowingly collect personal data from anyone
            under 18, and account registration is validated against this
            requirement.
          </p>

          <h2>How we use it</h2>
          <p>
            We use your information solely to respond to your enquiry,
            prepare a quote, coordinate delivery, and operate your account
            (cart and login). We do not sell your data, and we do not share
            it with third parties except where necessary to run the service
            you asked for (e.g. hosting infrastructure) or where the law
            requires it.
          </p>

          <h2>Cookies</h2>
          <p>
            Essential cookies (session/login) keep the site working and
            cannot be turned off without breaking login and cart
            functionality. Optional analytics/personalisation cookies are
            used only if you accept them via our cookie banner — nothing
            optional loads before you've made that choice. You can change
            your choice at any time by clearing site data or contacting us.
          </p>

          <h2>Retention</h2>
          <p>
            Enquiry and account information is retained for the duration of
            the business relationship, and thereafter as required by Indian
            tax and accounting law (typically 8 years for tax-relevant
            records). Session security logs are periodically purged and are
            not kept indefinitely.
          </p>

          <h2>Your rights</h2>
          <p>
            Under the DPDP Act you can request a copy of the personal data we
            hold about you, ask us to correct it, or ask us to delete it
            (subject to legal retention requirements such as tax records). If
            you have an account, you can also request an export or deletion
            of your account data directly. To exercise any of these rights,
            contact our Grievance Officer below.
          </p>

          <h2>Security</h2>
          <p>
            Form input is validated on both the browser and our server.
            Passwords are hashed, never stored in plain text. All traffic
            between your browser and our servers is encrypted (HTTPS).
            External links open with <code>rel="noopener noreferrer"</code>.
            We apply rate limiting and account lockout protections against
            automated abuse of login and enquiry forms.
          </p>

          <h2>Grievance Officer</h2>
          <p>
            In accordance with the DPDP Act and the Information Technology
            Rules, 2021, the following person is our Grievance Officer for
            any complaint or query about how your personal data is handled.
            We aim to acknowledge grievances within 7 working days and
            resolve them within 30 days.
          </p>
          <p>
            Grievance Officer, Volamp Elektrikals Private Limited
            <br />
            1753, Dhobi's Pole, Sir Chinubhai Road, Khadia, Ahmedabad 380001
            <br />
            Email:{" "}
            <a href="mailto:info@volampelektrikals.com">
              info@volampelektrikals.com
            </a>{" "}
            · Phone: +91 95123 55502
          </p>

          <h2>Changes to this policy</h2>
          <p>
            We may update this policy from time to time. Material changes
            will be reflected in the "Last updated" date above, and where a
            change affects how we use data you've already given us, we'll
            seek fresh consent where the DPDP Act requires it.
          </p>

          <h2>Contact</h2>
          <p>
            Volamp Elektrikals Private Limited, 1753 Dhobi's Pole, Sir Chinubhai
            Road, Khadia, Ahmedabad 380001. Phone: +91 95123 55502.
          </p>
        </Prose>
      </Section>
    </>
  );
}

function Prose({ children }) {
  return (
    <div className="prose prose-neutral max-w-none [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[color:var(--maroon)] [&_h2]:mt-6 [&_h2]:mb-1.5 [&_p]:text-xs [&_p]:text-foreground/75 [&_p]:leading-relaxed [&_p]:font-medium [&_a]:text-[color:var(--orange)] [&_a]:underline [&_ul]:text-xs [&_ul]:text-foreground/75 [&_ul]:leading-relaxed [&_ul]:font-medium [&_li]:mt-1">
      {children}
    </div>
  );
}
