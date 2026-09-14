import type { Metadata } from "next";
import { Card, CardHeader } from "@/components/ui/card";
import Link from "next/link";

export const metadata: Metadata = { title: "More" };

const LINKS = [
  { href: "/photos", label: "Photos", icon: "▣" },
  { href: "/events", label: "Email / Events", icon: "✉" },
  { href: "/phone", label: "Phone Intelligence", icon: "☎" },
  { href: "/camera", label: "Camera Verification", icon: "◉" },
  { href: "/analytics", label: "Analytics", icon: "▲" },
  { href: "/notifications", label: "Notifications", icon: "●" },
  { href: "/users", label: "Users", icon: "◫" },
  { href: "/settings", label: "Settings", icon: "⚙" },
  { href: "/audit", label: "Audit Logs", icon: "▦" },
  { href: "/admin", label: "Admin", icon: "◆" },
];

export default function MorePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-xs uppercase tracking-widest text-accent">Menu</p>
        <h1 className="mt-1 font-display text-2xl text-[color:var(--color-text)]">More</h1>
      </div>
      <Card>
        <CardHeader title="All Sections" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-2 rounded-lg border border-[color:var(--color-panel-border)] px-3 py-3 text-sm hover:border-accent hover:text-accent"
            >
              <span>{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
