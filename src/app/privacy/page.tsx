import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl bg-[color:var(--color-bg)] px-6 py-16 text-[color:var(--color-text)]">
      <p className="font-display text-xs uppercase tracking-widest text-accent">Legal</p>
      <h1 className="mt-2 font-display text-3xl">Privacy Policy</h1>
      <div className="mt-8 space-y-6 text-sm text-[color:var(--color-text-dim)]">
        <Section title="What we collect">
          Depending on how a case operator configures a tracking link, we may collect: ordinary web
          request metadata (device type, browser, referrer, language, and a one-way hashed IP —
          never the raw IP), browser-reported GPS coordinates and accuracy (only after you approve
          your browser's location permission prompt), a single camera photo (only after you approve
          your browser's camera permission prompt), and uploaded photo files including any embedded
          EXIF metadata.
        </Section>
        <Section title="What we never do">
          We never collect location or camera data silently or without your explicit, informed,
          in-browser permission grant. We never fabricate GPS, cell tower, or carrier data. We never
          claim to locate a phone number via SS7 or any telecom signaling protocol — no such feature
          exists in this product.
        </Section>
        <Section title="Purpose">
          Data is collected for the specific, disclosed purpose shown on the tracking link (e.g.
          delivery confirmation, identity verification, incident investigation) and to maintain an
          audit trail of consent decisions.
        </Section>
        <Section title="Retention">
          Retention windows for tracking, location, photo, camera, and audit data are configurable
          by administrators in Settings. Expired or revoked tracking sessions stop accepting new
          evidence immediately.
        </Section>
        <Section title="Your choices">
          You may deny any permission request. Denials are recorded truthfully and never
          substituted with fabricated data. Authorized users may request deletion of their evidence
          or account by contacting the operator who created the relevant case.
        </Section>
        <Section title="Estimated vs. verified">
          Any location or identity signal that is inferred rather than directly measured is labeled
          ESTIMATED. Only data with a genuine, verifiable source (e.g. your browser's GPS reading)
          is labeled with a corresponding confidence level.
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-sm uppercase tracking-wide text-accent">{title}</h2>
      <p className="mt-2 leading-relaxed">{children}</p>
    </section>
  );
}
