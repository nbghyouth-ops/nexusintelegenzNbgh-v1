import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary: "bg-accent text-black hover:brightness-110 border-transparent",
  secondary: "bg-white/5 text-[color:var(--color-text)] border-white/10 hover:bg-white/10",
  danger: "bg-red-500/10 text-red-300 border-red-800/60 hover:bg-red-500/20",
  ghost: "bg-transparent text-accent border-transparent hover:bg-white/5",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-40 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}

export function LinkButton({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide transition ${variantClasses[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
