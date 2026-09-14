import type { Metadata } from "next";
import { db } from "@/db";
import { cameraSessions, trackingSessions, cases } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import Link from "next/link";

export const metadata: Metadata = { title: "Camera Verification" };
export const dynamic = "force-dynamic";
const PAGE_SIZE = 20;

export default async function CameraPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(cameraSessions);
  const rows = await db
    .select({
      id: cameraSessions.id,
      status: cameraSessions.status,
      createdAt: cameraSessions.createdAt,
      label: trackingSessions.label,
      caseNumber: cases.caseNumber,
    })
    .from(cameraSessions)
    .leftJoin(trackingSessions, eq(cameraSessions.trackingSessionId, trackingSessions.id))
    .leftJoin(cases, eq(cameraSessions.caseId, cases.id))
    .orderBy(desc(cameraSessions.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-xs uppercase tracking-widest text-accent">Verification</p>
        <h1 className="mt-1 font-display text-2xl text-[color:var(--color-text)]">Camera Verification Sessions</h1>
        <p className="mt-1 text-sm text-[color:var(--color-text-dim)]">
          Every capture here was taken only after the recipient explicitly approved their browser&apos;s camera
          permission prompt on a disclosed tracking link.
        </p>
      </div>
      <Card>
        <CardHeader title="Sessions" />
        {rows.length === 0 ? (
          <EmptyState title="No camera sessions yet" description="Enable 'Request camera' when creating a tracking session to use this feature." />
        ) : (
          <ul className="divide-y divide-[color:var(--color-panel-border)] text-sm">
            {rows.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-3">
                <div>
                  <Link href={`/camera/sessions/${c.id}`} className="text-accent hover:underline">
                    {c.label ?? "Camera session"}
                  </Link>
                  <p className="text-xs text-[color:var(--color-text-dim)]">{c.caseNumber ?? "Unlinked"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={c.status} />
                  <span className="text-xs text-[color:var(--color-text-dim)]">{new Date(c.createdAt).toLocaleString()}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Pagination basePath="/camera" page={page} pageSize={PAGE_SIZE} total={count ?? 0} />
      </Card>
    </div>
  );
}
