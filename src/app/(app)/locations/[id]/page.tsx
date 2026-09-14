import type { Metadata } from "next";
import { db } from "@/db";
import { locationEvidence, trackingSessions, cases } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { LocationMap, googleMapsUrl } from "@/components/map/location-map";
import { getCurrentUser } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Location Evidence" };

export default async function LocationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await db
    .select({
      id: locationEvidence.id,
      latitude: locationEvidence.latitude,
      longitude: locationEvidence.longitude,
      accuracyMeters: locationEvidence.accuracyMeters,
      source: locationEvidence.source,
      confidence: locationEvidence.confidence,
      status: locationEvidence.status,
      provider: locationEvidence.provider,
      capturedAt: locationEvidence.capturedAt,
      receivedAt: locationEvidence.receivedAt,
      metadata: locationEvidence.metadata,
      caseNumber: cases.caseNumber,
      sessionLabel: trackingSessions.label,
    })
    .from(locationEvidence)
    .leftJoin(cases, eq(locationEvidence.caseId, cases.id))
    .leftJoin(trackingSessions, eq(locationEvidence.trackingSessionId, trackingSessions.id))
    .where(eq(locationEvidence.id, id))
    .limit(1);

  const record = rows[0];
  if (!record) notFound();

  const user = await getCurrentUser();
  await logAudit({ actorId: user?.id, action: "LOCATION_ACCESSED", targetType: "location_evidence", targetId: id });

  const hasCoords = record.latitude != null && record.longitude != null;

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-xs uppercase tracking-widest text-accent">{record.caseNumber ?? "Unlinked"}</p>
        <h1 className="mt-1 font-display text-2xl text-[color:var(--color-text)]">Location Evidence</h1>
        <p className="text-sm text-[color:var(--color-text-dim)]">Session: {record.sessionLabel ?? "—"}</p>
      </div>

      <Card>
        <CardHeader title="Map" />
        <LocationMap
          points={
            hasCoords
              ? [{ id: record.id, latitude: record.latitude!, longitude: record.longitude!, label: "Evidence", confidence: record.confidence }]
              : []
          }
          height={420}
        />
        {hasCoords && (
          <a
            href={googleMapsUrl(record.latitude!, record.longitude!)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block rounded-full border border-accent/40 px-4 py-1.5 font-display text-xs uppercase tracking-wide text-accent hover:bg-[color:var(--color-accent-soft)]"
          >
            Open in Google Maps ↗
          </a>
        )}
      </Card>

      <Card>
        <CardHeader title="Provenance" subtitle="Where, when, and how this evidence was captured" />
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <Detail label="Source"><StatusBadge status={record.source} /></Detail>
          <Detail label="Confidence"><StatusBadge status={record.confidence} /></Detail>
          <Detail label="Status"><StatusBadge status={record.status} /></Detail>
          <Detail label="Accuracy">{record.accuracyMeters != null ? `${Math.round(record.accuracyMeters)} m` : "—"}</Detail>
          <Detail label="Provider">{record.provider ?? "—"}</Detail>
          <Detail label="Captured At">{record.capturedAt ? new Date(record.capturedAt).toLocaleString() : "—"}</Detail>
          <Detail label="Received At">{new Date(record.receivedAt).toLocaleString()}</Detail>
        </dl>
        {record.metadata ? (
          <details className="mt-4 text-xs text-[color:var(--color-text-dim)]">
            <summary className="cursor-pointer text-accent">Raw metadata (log)</summary>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-black/40 p-3">{JSON.stringify(record.metadata, null, 2)}</pre>
          </details>
        ) : null}
      </Card>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wide text-[color:var(--color-text-dim)]">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}
