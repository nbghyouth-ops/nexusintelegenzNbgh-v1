"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOBILE_NAV } from "./nav-items";

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[color:var(--color-panel-border)] bg-[color:var(--color-bg-elevated)]/95 backdrop-blur lg:hidden">
      {MOBILE_NAV.map((item) => {
        const active = pathname === item.href || (item.href !== "/more" && pathname.startsWith(item.href + "/"));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] uppercase tracking-wide ${
              active ? "text-accent" : "text-[color:var(--color-text-dim)]"
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
