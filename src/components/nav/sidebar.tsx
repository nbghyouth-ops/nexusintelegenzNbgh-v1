"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRIMARY_NAV, ADMIN_NAV } from "./nav-items";
import { isAdmin, type Role } from "@/lib/auth/rbac";

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <aside className="scrollbar-thin sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-[color:var(--color-panel-border)] bg-[color:var(--color-bg-elevated)] px-4 py-6 lg:flex">
      <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent text-accent">◆</span>
        <div>
          <p className="font-display text-sm text-accent">HELIX_OPS</p>
          <p className="text-[10px] uppercase tracking-widest text-[color:var(--color-text-dim)]">Case Intelligence</p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1">
        {PRIMARY_NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? "bg-[color:var(--color-accent-soft)] text-accent"
                  : "text-[color:var(--color-text-dim)] hover:bg-white/5 hover:text-[color:var(--color-text)]"
              }`}
            >
              <span className="w-4 text-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        {isAdmin(role) ? (
          <>
            <p className="mt-6 mb-1 px-3 font-display text-[10px] uppercase tracking-widest text-[color:var(--color-text-dim)]">
              Admin
            </p>
            {ADMIN_NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    active
                      ? "bg-[color:var(--color-accent-soft)] text-accent"
                      : "text-[color:var(--color-text-dim)] hover:bg-white/5 hover:text-[color:var(--color-text)]"
                  }`}
                >
                  <span className="w-4 text-center">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/admin"
              className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[color:var(--color-text-dim)] hover:bg-white/5 hover:text-[color:var(--color-text)]"
            >
              <span className="w-4 text-center">◆</span>
              Admin Overview
            </Link>
          </>
        ) : null}
      </nav>
    </aside>
  );
}
