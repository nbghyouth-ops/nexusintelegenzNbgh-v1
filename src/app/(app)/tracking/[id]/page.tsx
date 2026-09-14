import type { Metadata } from "next";
import { db } from "@/db";
import { trackingSessions, trackingVisits, consents, locationEvidence, cameraSessions, cases } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { RevokeButton } from "./revoke-button";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const rows = await db.select({ label: trackingSessions.label }).from(trackingSessions).where(eq(trackingSessions.id, id)).limit(1);
  return { title: rows[0]?.label ?? "Tracking Session" };
}

export default async function TrackingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await db
    .select({
      id: trackingSessions.id,
      label: trackingSessions.label,
      purpose: trackingSessions.purpose,
      status: trackingSessions.status,
      requiresLocation: trackingSessions.requiresLocation,
      requiresCamera: trackingSessions.requiresCamera,
      visitCount: trackingSessions.visitCount,
      createdAt: trackingSessions.createdAt,
      expiresAt: trackingSessions.expiresAt,
      firstVisitAt: trackingSessions.firstVisitAt,
      lastVisitAt: trackingSessions.lastVisitAt,
      caseNumber: cases.caseNumber,
    })
    .from(trackingSessions)
    .leftJoin(cases, eq(trackingSessions.caseId, cases.id))
    .where(eq(trackingSessions.id, id))
    .limit(1);

  const session = rows[0];
  if (!session) notFound();

  const [visits, consentRows, locations, cameras] = await Promise.all([
    db.select().from(trackingVisits).where(eq(trackingVisits.sessionId, id)).orderBy(desc(trackingVisits.occurredAt)).limit(50),
    db.select().from(consents).where(eq(consents.trackingSessionId, id)).orderBy(desc(consents.createdAt)),
    db.select().from(locationEvidence).where(eq(locationEvidence.trackingSessionId, id)).orderBy(desc(locationEvidence.receivedAt)),
    db.select().from(cameraSessions).where(eq(cameraSessions.trackingSessionId, id)).orderBy(desc(cameraSessions.createdAt)),
  ]);

  const isExpired = session.expiresAt.getTime() < Date.now();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-xs uppercase tracking-widest text-accent">{session.caseNumber ?? "Unlinked"}</p>
          <h1 className="mt-1 font-display text-2xl text-[color:var(--color-text)]">{session.label}</h1>
          <p className="mt-1 max-w-xl text-sm text-[color:var(--color-text-dim)]">{session.purpose}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={isExpired && session.status === "ACTIVE" ? "EXPIRED" : session.status} />
          {session.status === "ACTIVE" && !isExpired ? <RevokeButton sessionId={session.id} /> : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MiniStat label="Visits" value={session.visitCount} />
        <MiniStat label="Requires Location" value={session.requiresLocation ? "Yes" : "No"} />
        <MiniStat label="Requires Camera" value={session.requiresCamera ? "Yes" : "No"} />
        <MiniStat label="Expires" value={new Date(session.expiresAt).toLocaleDateString()} />
      </div>

      <Card>
        <CardHeader title="Visits" subtitle="Ordinary web request metadata — not GPS" />
        {visits.length === 0 ? (
          <EmptyState title="No visits recorded yet" />
        ) : (
          <ul className="divide-y divide-[color:var(--color-panel-border)] text-sm">
            {visits.map((v) => (
              <li key={v.id} className="flex items-center justify-between py-2">
                <span>
                  {v.deviceType ?? "unknown"} · {v.browser ?? "unknown"} · {v.os ?? "unknown"}
                </span>
                <span className="text-xs text-[color:var(--color-text-dim)]">{new Date(v.occurredAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader title="Consent Records" />
        {consentRows.length === 0 ? (
          <EmptyState title="No consent requests yet" />
        ) : (
          <ul className="divide-y divide-[color:var(--color-panel-border)] text-sm">
            {consentRows.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2">
                <span>{c.permissionType}</span>
                <StatusBadge status={c.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader title="Location Evidence" />
        {locations.length === 0 ? (
          <EmptyState title="No location evidence submitted" />
        ) : (
          <ul className="divide-y divide-[color:var(--color-panel-border)] text-sm">
            {locations.map((l) => (
              <li key={l.id} className="flex items-center justify-between py-2">
                <span>{l.latitude != null ? `${l.latitude.toFixed(5)}, ${l.longitude?.toFixed(5)}` : "No coordinates"}</span>
                <div className="flex gap-2">
                  <StatusBadge status={l.source} />
                  <StatusBadge status={l.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader title="Camera Sessions" />
        {cameras.length === 0 ? (
          <EmptyState title="No camera sessions" />
        ) : (
          <ul className="divide-y divide-[color:var(--color-panel-border)] text-sm">
            {cameras.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2">
                <span>{new Date(c.createdAt).toLocaleString()}</span>
                <StatusBadge status={c.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="panel p-4">
      <p className="text-[10px] uppercase tracking-wide text-[color:var(--color-text-dim)]">{label}</p>
      <p className="mt-1 font-display text-lg text-accent">{value}</p>
    </div>
  );
}
