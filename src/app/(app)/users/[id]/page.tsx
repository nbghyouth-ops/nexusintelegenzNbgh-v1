import type { Metadata } from "next";
import { db } from "@/db";
import { users, cases, auditLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/rbac";
import { redirect } from "next/navigation";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "User Detail" };

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const current = await getCurrentUser();
  if (!current) redirect("/login");
  if (!hasPermission(current.role, "users.read")) redirect("/dashboard");

  const { id } = await params;
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  const record = rows[0];
  if (!record) notFound();

  const ownedCases = await db.select().from(cases).where(eq(cases.ownerId, id)).orderBy(desc(cases.createdAt)).limit(20);
  const activity = await db.select().from(auditLogs).where(eq(auditLogs.actorId, id)).orderBy(desc(auditLogs.createdAt)).limit(20);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-xs uppercase tracking-widest text-accent">{record.role}</p>
        <h1 className="mt-1 font-display text-2xl text-[color:var(--color-text)]">{record.name}</h1>
        <p className="text-sm text-[color:var(--color-text-dim)]">{record.email}</p>
      </div>

      <Card>
        <CardHeader title="Owned Cases" />
        {ownedCases.length === 0 ? (
          <EmptyState title="No cases owned" />
        ) : (
          <ul className="divide-y divide-[color:var(--color-panel-border)] text-sm">
            {ownedCases.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2">
                <Link href={`/cases/${c.id}`} className="text-accent hover:underline">
                  {c.caseNumber} — {c.title}
                </Link>
                <StatusBadge status={c.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader title="Recent Activity" />
        {activity.length === 0 ? (
          <EmptyState title="No recorded activity" />
        ) : (
          <ul className="space-y-2 text-xs">
            {activity.map((a) => (
              <li key={a.id} className="flex justify-between">
                <span className="font-display text-accent">{a.action}</span>
                <span className="text-[color:var(--color-text-dim)]">{new Date(a.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
