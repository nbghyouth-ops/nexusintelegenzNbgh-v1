import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div className={`panel ${glow ? "panel-glow" : ""} p-5 ${className}`}>{children}</div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h3 className="font-display text-sm uppercase tracking-wider text-accent">{title}</h3>
        {subtitle ? <p className="mt-1 text-xs text-[color:var(--color-text-dim)]">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <Card>
      <p className="font-display text-[11px] uppercase tracking-widest text-[color:var(--color-text-dim)]">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl text-accent">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[color:var(--color-text-dim)]">{hint}</p> : null}
    </Card>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[color:var(--color-panel-border)] px-6 py-14 text-center">
      <p className="font-display text-sm uppercase tracking-wide text-[color:var(--color-text-dim)]">{title}</p>
      {description ? <p className="mt-2 max-w-sm text-sm text-[color:var(--color-text-dim)]">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
