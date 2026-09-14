import type { Metadata } from "next";
import { db } from "@/db";
import { cameraSessions, cameraCaptures, trackingSessions, cases } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Camera Session" };

export default async function CameraSessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await db
    .select({
      id: cameraSessions.id,
      status: cameraSessions.status,
      startedAt: cameraSessions.startedAt,
      endedAt: cameraSessions.endedAt,
      createdAt: cameraSessions.createdAt,
      label: trackingSessions.label,
      caseNumber: cases.caseNumber,
    })
    .from(cameraSessions)
    .leftJoin(trackingSessions, eq(cameraSessions.trackingSessionId, trackingSessions.id))
    .leftJoin(cases, eq(cameraSessions.caseId, cases.id))
    .where(eq(cameraSessions.id, id))
    .limit(1);

  const record = rows[0];
  if (!record) notFound();

  const captures = await db.select().from(cameraCaptures).where(eq(cameraCaptures.cameraSessionId, id));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-xs uppercase tracking-widest text-accent">{record.caseNumber ?? "Unlinked"}</p>
          <h1 className="mt-1 font-display text-2xl text-[color:var(--color-text)]">{record.label ?? "Camera Session"}</h1>
        </div>
        <StatusBadge status={record.status} />
      </div>

      <Card>
        <CardHeader title="Captures" />
        {captures.length === 0 ? (
          <EmptyState title="No captures recorded" description="This session was started but no photo was captured or submitted." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {captures.map((c) => (
              <div key={c.id} className="overflow-hidden rounded-lg border border-[color:var(--color-panel-border)]">
                <img src={`data:${c.mimeType};base64,${c.dataBase64}`} alt="Camera capture" className="w-full object-cover" />
                <p className="p-2 text-xs text-[color:var(--color-text-dim)]">{new Date(c.capturedAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
