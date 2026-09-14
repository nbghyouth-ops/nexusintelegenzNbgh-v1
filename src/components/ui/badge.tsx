import type { ReactNode } from "react";

type Tone = "accent" | "warn" | "danger" | "info" | "neutral";

const toneClasses: Record<Tone, string> = {
  accent: "bg-[color:var(--color-accent-soft)] text-accent border-[color:var(--color-accent-dim)]",
  warn: "bg-amber-500/10 text-amber-400 border-amber-700/50",
  danger: "bg-red-500/10 text-red-400 border-red-800/50",
  info: "bg-sky-500/10 text-sky-300 border-sky-800/50",
  neutral: "bg-white/5 text-slate-300 border-white/10",
};

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide font-display ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

const STATUS_TONE: Record<string, Tone> = {
  ACTIVE: "accent",
  LIVE: "accent",
  GRANTED: "accent",
  COMPLETED: "accent",
  ANALYZED: "accent",
  VERY_HIGH: "accent",
  HIGH: "accent",
  OPEN: "info",
  RECENT: "info",
  PROCESSING: "info",
  MEDIUM: "info",
  PENDING: "warn",
  STALE: "warn",
  WAITING_PERMISSION: "warn",
  UPLOADING: "warn",
  LOW: "warn",
  VERY_LOW: "danger",
  EXPIRED: "danger",
  REVOKED: "danger",
  DENIED: "danger",
  DISABLED: "danger",
  CANCELLED: "danger",
  ERROR: "danger",
  UNAVAILABLE: "neutral",
  NO_METADATA: "neutral",
  ARCHIVED: "neutral",
  UNKNOWN: "neutral",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={STATUS_TONE[status] ?? "neutral"}>{status.replace(/_/g, " ")}</Badge>
  );
}
