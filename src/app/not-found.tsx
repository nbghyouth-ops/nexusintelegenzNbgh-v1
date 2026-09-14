import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid-fade flex min-h-screen items-center justify-center bg-[color:var(--color-bg)] px-4">
      <div className="panel max-w-md p-8 text-center">
        <p className="font-display text-xs uppercase tracking-widest text-accent">404</p>
        <h1 className="mt-3 font-display text-xl text-[color:var(--color-text)]">Page not found</h1>
        <p className="mt-3 text-sm text-[color:var(--color-text-dim)]">
          The page you are looking for does not exist or you do not have access to it.
        </p>
        <Link href="/dashboard" className="mt-6 inline-block rounded-full bg-accent px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide text-black">
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
