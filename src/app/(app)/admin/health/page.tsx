import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/rbac";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "System Health" };
export const dynamic = "force-dynamic";

async function checkDatabase(): Promise<boolean> {
  try {
    await db.execute(sql`select 1`);
    return true;
  } catch {
    return false;
  }
}

export default async function HealthPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isAdmin(user.role)) redirect("/dashboard");

  const dbOk = await checkDatabase();

  const checks = [
    { name: "PostgreSQL Database", ok: dbOk, detail: "Drizzle ORM connection pool" },
    { name: "Authentication", ok: true, detail: "Cookie-based sessions with bcrypt password hashing" },
    { name: "Object Storage", ok: true, detail: "Database-backed (base64) — see /docs/ARCHITECTURE.md for production guidance" },
    { name: "Realtime Updates", ok: false, detail: "Not implemented in this environment — dashboards use server-rendered polling/refresh instead" },
    { name: "Environment Variables", ok: Boolean(process.env.DATABASE_URL), detail: "DATABASE_URL present" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-xs uppercase tracking-widest text-accent">Administration</p>
        <h1 className="mt-1 font-display text-2xl text-[color:var(--color-text)]">System Health</h1>
      </div>
      <Card>
        <CardHeader title="Checks" />
        <ul className="divide-y divide-[color:var(--color-panel-border)]">
          {checks.map((c) => (
            <li key={c.name} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p>{c.name}</p>
                <p className="text-xs text-[color:var(--color-text-dim)]">{c.detail}</p>
              </div>
              <Badge tone={c.ok ? "accent" : "warn"}>{c.ok ? "OK" : "LIMITED"}</Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
