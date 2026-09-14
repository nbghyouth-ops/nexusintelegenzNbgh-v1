import type { ReactNode } from "react";

export function Field({
  label,
  children,
  hint,
  error,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-display text-[11px] uppercase tracking-wide text-[color:var(--color-text-dim)]">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-[color:var(--color-text-dim)]">{hint}</span> : null}
      {error ? <span className="mt-1 block text-xs text-red-400">{error}</span> : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-[color:var(--color-panel-border)] bg-black/40 px-3 py-2.5 text-sm text-[color:var(--color-text)] outline-none focus:border-accent focus:ring-1 focus:ring-accent placeholder:text-[color:var(--color-text-dim)]";
