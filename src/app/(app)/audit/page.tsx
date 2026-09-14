import type { Metadata } from "next";
import { db } from "@/db";
import { auditLogs, users } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/rbac";
import { redirect } from "next/navigation";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";

export const metadata: Metadata = { title: "Audit Logs" };
export const dynamic = "force-dynamic";
const PAGE_SIZE = 30;

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.role, "audit.read")) redirect("/dashboard");

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(auditLogs);
  const rows = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      targetType: auditLogs.targetType,
      targetId: auditLogs.targetId,
      createdAt: auditLogs.createdAt,
      actorName: users.name,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.actorId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-xs uppercase tracking-widest text-accent">Compliance</p>
        <h1 className="mt-1 font-display text-2xl text-[color:var(--color-text)]">Audit Logs</h1>
        <p className="mt-1 text-sm text-[color:var(--color-text-dim)]">
          Immutable via the application layer — audit entries are never editable through the UI.
        </p>
      </div>
      <Card>
        <CardHeader title="Events" />
        {rows.length === 0 ? (
          <EmptyState title="No audit entries yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[color:var(--color-panel-border)] text-[10px] uppercase tracking-wide text-[color:var(--color-text-dim)]">
                  <th className="pb-2">Action</th>
                  <th className="pb-2">Actor</th>
                  <th className="pb-2">Target</th>
                  <th className="pb-2">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--color-panel-border)]">
                {rows.map((a) => (
                  <tr key={a.id}>
                    <td className="py-2 font-display text-accent">{a.action}</td>
                    <td className="py-2 text-[color:var(--color-text-dim)]">{a.actorName ?? "system / anonymous"}</td>
                    <td className="py-2 text-[color:var(--color-text-dim)]">{a.targetType ? `${a.targetType}:${a.targetId?.slice(0, 8)}` : "—"}</td>
                    <td className="py-2 text-[color:var(--color-text-dim)]">{new Date(a.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination basePath="/audit" page={page} pageSize={PAGE_SIZE} total={count ?? 0} />
      </Card>
    </div>
  );
}
