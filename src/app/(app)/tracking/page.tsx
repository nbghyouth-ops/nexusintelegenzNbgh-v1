import type { Metadata } from "next";
import { db } from "@/db";
import { trackingSessions, cases } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import Link from "next/link";

export const metadata: Metadata = { title: "Tracking" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;

export default async function TrackingPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(trackingSessions);

  const rows = await db
    .select({
      id: trackingSessions.id,
      label: trackingSessions.label,
      status: trackingSessions.status,
      visitCount: trackingSessions.visitCount,
      expiresAt: trackingSessions.expiresAt,
      createdAt: trackingSessions.createdAt,
      caseNumber: cases.caseNumber,
    })
    .from(trackingSessions)
    .leftJoin(cases, eq(trackingSessions.caseId, cases.id))
    .orderBy(desc(trackingSessions.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-xs uppercase tracking-widest text-accent">Verification</p>
          <h1 className="mt-1 font-display text-2xl text-[color:var(--color-text)]">Tracking Sessions</h1>
        </div>
        <LinkButton href="/tracking/new">+ New Session</LinkButton>
      </div>

      <Card>
        <CardHeader title="All Sessions" />
        {rows.length === 0 ? (
          <EmptyState
            title="No tracking sessions yet"
            description="Create a consent-aware tracking link to begin collecting disclosed visit and location evidence."
            action={<LinkButton href="/tracking/new">Create Session</LinkButton>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[color:var(--color-panel-border)] text-[10px] uppercase tracking-wide text-[color:var(--color-text-dim)]">
                  <th className="pb-2">Label</th>
                  <th className="pb-2">Case</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Visits</th>
                  <th className="pb-2">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--color-panel-border)]">
                {rows.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02]">
                    <td className="py-3">
                      <Link href={`/tracking/${s.id}`} className="text-accent hover:underline">
                        {s.label}
                      </Link>
                    </td>
                    <td className="py-3 text-[color:var(--color-text-dim)]">{s.caseNumber ?? "—"}</td>
                    <td className="py-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="py-3">{s.visitCount}</td>
                    <td className="py-3 text-[color:var(--color-text-dim)]">{new Date(s.expiresAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination basePath="/tracking" page={page} pageSize={PAGE_SIZE} total={count ?? 0} />
      </Card>
    </div>
  );
}
