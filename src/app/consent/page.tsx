import type { Metadata } from "next";

export const metadata: Metadata = { title: "How Consent Works" };

const STEPS = [
  { title: "1. Disclosure", desc: "Before any permission is requested, the recipient sees the link's real purpose and exactly which permissions (location and/or camera) will be requested." },
  { title: "2. Native Browser Prompt", desc: "Permission is requested through the browser's own Geolocation or Camera permission prompt — never bypassed, faked, or auto-granted." },
  { title: "3. Explicit Decision", desc: "Every grant or denial is recorded as a consent record with a timestamp, tied to the specific tracking session." },
  { title: "4. Honest Outcome", desc: "If permission is denied or unavailable, that is what gets recorded — never substituted with fabricated coordinates or a fake camera image." },
  { title: "5. Revocation", desc: "Case operators can revoke a tracking link at any time, immediately preventing any further evidence submission." },
];

export default function ConsentPage() {
  return (
    <main className="mx-auto max-w-3xl bg-[color:var(--color-bg)] px-6 py-16 text-[color:var(--color-text)]">
      <p className="font-display text-xs uppercase tracking-widest text-accent">Trust</p>
      <h1 className="mt-2 font-display text-3xl">How Consent Works</h1>
      <p className="mt-4 text-sm text-[color:var(--color-text-dim)]">
        Helix Ops is built around one rule: no sensitive data is ever collected without an explicit,
        informed, in-browser permission grant from the person using the link.
      </p>
      <ol className="mt-8 space-y-6">
        {STEPS.map((s) => (
          <li key={s.title} className="panel p-5">
            <h2 className="font-display text-sm uppercase tracking-wide text-accent">{s.title}</h2>
            <p className="mt-2 text-sm text-[color:var(--color-text-dim)]">{s.desc}</p>
          </li>
        ))}
      </ol>
    </main>
  );
}
