import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Helix Ops — Consent-Aware Location Intelligence",
  description:
    "Helix Ops helps teams manage consent-based tracking links, evidence, and verification with full transparency and audit trails.",
};

const FEATURES = [
  { title: "Consent-First Tracking", desc: "Every tracking link truthfully discloses its purpose before requesting any sensitive permission." },
  { title: "Evidence Provenance", desc: "Every location record answers where, when, from what source, and with what confidence." },
  { title: "Case Management", desc: "Organize tracking sessions, photos, camera verifications, and notes under structured cases." },
  { title: "Full Audit Trail", desc: "Every sensitive action is logged — logins, consent decisions, evidence access, and role changes." },
];

export default function LandingPage() {
  return (
    <main className="grid-fade min-h-screen bg-[color:var(--color-bg)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent text-accent">◆</span>
          <span className="font-display text-sm text-accent">HELIX_OPS</span>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/privacy" className="text-[color:var(--color-text-dim)] hover:text-accent">Privacy</Link>
          <Link href="/terms" className="text-[color:var(--color-text-dim)] hover:text-accent">Terms</Link>
          <Link href="/login" className="rounded-full border border-white/10 px-4 py-1.5 hover:border-accent hover:text-accent">Sign in</Link>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-24 pt-16 text-center">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-accent">Case Intelligence Platform</p>
        <h1 className="mt-4 font-display text-4xl leading-tight text-[color:var(--color-text)] sm:text-5xl">
          Consent-aware location intelligence &amp; evidence management
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-[color:var(--color-text-dim)]">
          Helix Ops gives operations and trust &amp; safety teams a transparent way to run verification
          links, collect disclosed browser location and camera evidence, manage cases, and keep a
          full audit trail — without ever fabricating data.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/register" className="rounded-full bg-accent px-6 py-3 font-display text-xs font-semibold uppercase tracking-wide text-black hover:brightness-110">
            Get Started
          </Link>
          <Link href="/consent" className="rounded-full border border-white/10 px-6 py-3 font-display text-xs uppercase tracking-wide text-[color:var(--color-text)] hover:border-accent hover:text-accent">
            How Consent Works
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-6 pb-24 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="panel p-6">
            <h3 className="font-display text-sm uppercase tracking-wide text-accent">{f.title}</h3>
            <p className="mt-2 text-sm text-[color:var(--color-text-dim)]">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-[color:var(--color-panel-border)] px-6 py-8 text-center text-xs text-[color:var(--color-text-dim)]">
        © {new Date().getFullYear()} Helix Ops. Built for lawful, transparent, consent-based verification only.
      </footer>
    </main>
  );
}
