import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl bg-[color:var(--color-bg)] px-6 py-16 text-[color:var(--color-text)]">
      <p className="font-display text-xs uppercase tracking-widest text-accent">Legal</p>
      <h1 className="mt-2 font-display text-3xl">Terms of Service</h1>
      <div className="mt-8 space-y-6 text-sm text-[color:var(--color-text-dim)]">
        <Section title="Permitted use">
          This platform is intended for lawful, consent-based verification, delivery confirmation,
          incident investigation, and evidence management. You must have a legitimate, disclosed
          purpose for every tracking link you create.
        </Section>
        <Section title="Prohibited use">
          You may not use this platform to covertly collect location, camera, or personal data
          without informed consent; to impersonate another service or brand; to harass, stalk, or
          defraud any person; or to claim capabilities this platform does not have (e.g. SS7 or
          cellular subscriber location).
        </Section>
        <Section title="Accountability">
          All sensitive actions are recorded in an audit log tied to the authenticated operator who
          performed them. Administrators may review this log at any time.
        </Section>
        <Section title="No warranty of location accuracy">
          Location evidence reflects only what the underlying source (browser GPS, image EXIF, or
          manual entry) actually reports. Accuracy, availability, and confidence vary and are never
          guaranteed.
        </Section>
        <Section title="Termination">
          Accounts found to violate these terms, including any attempt to build covert surveillance
          or fraudulent tracking features, may be suspended immediately.
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
