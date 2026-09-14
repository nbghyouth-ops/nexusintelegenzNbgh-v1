import type { Metadata } from "next";
import { db } from "@/db";
import {
  cases,
  caseNotes,
  users,
  trackingSessions,
  locationEvidence,
  photoRecords,
  cameraSessions,
  auditLogs,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { CaseStatusForm } from "./case-status-form";
import { CaseNoteForm } from "./case-note-form";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const rows = await db.select({ caseNumber: cases.caseNumber }).from(cases).where(eq(cases.id, id)).limit(1);
  return { title: rows[0]?.caseNumber ?? "Case" };
}

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await db
    .select({
      id: cases.id,
      caseNumber: cases.caseNumber,
      title: cases.title,
      description: cases.description,
      status: cases.status,
      createdAt: cases.createdAt,
      ownerName: users.name,
    })
    .from(cases)
    .innerJoin(users, eq(cases.ownerId, users.id))
    .where(eq(cases.id, id))
    .limit(1);

  const record = rows[0];
  if (!record) notFound();

  const [notes, sessions, locations, photos, cameras, audit] = await Promise.all([
    db
      .select({ id: caseNotes.id, body: caseNotes.body, createdAt: caseNotes.createdAt, authorName: users.name })
      .from(caseNotes)
      .innerJoin(users, eq(caseNotes.authorId, users.id))
      .where(eq(caseNotes.caseId, id))
      .orderBy(desc(caseNotes.createdAt)),
    db.select().from(trackingSessions).where(eq(trackingSessions.caseId, id)).orderBy(desc(trackingSessions.createdAt)),
    db.select().from(locationEvidence).where(eq(locationEvidence.caseId, id)).orderBy(desc(locationEvidence.receivedAt)),
    db.select().from(photoRecords).where(eq(photoRecords.caseId, id)).orderBy(desc(photoRecords.createdAt)),
    db.select().from(cameraSessions).where(eq(cameraSessions.caseId, id)).orderBy(desc(cameraSessions.createdAt)),
    db.select().from(auditLogs).where(eq(auditLogs.targetId, id)).orderBy(desc(auditLogs.createdAt)).limit(20),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-xs uppercase tracking-widest text-accent">{record.caseNumber}</p>
          <h1 className="mt-1 font-display text-2xl text-[color:var(--color-text)]">{record.title}</h1>
          <p className="mt-1 text-sm text-[color:var(--color-text-dim)]">
            Opened by {record.ownerName} on {new Date(record.createdAt).toLocaleString()}
          </p>
        </div>
        <StatusBadge status={record.status} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Overview" />
          <p className="text-sm text-[color:var(--color-text-dim)]">{record.description || "No description provided."}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
            <Stat label="Tracking Sessions" value={sessions.length} />
            <Stat label="Location Evidence" value={locations.length} />
            <Stat label="Photos" value={photos.length} />
            <Stat label="Camera Sessions" value={cameras.length} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Update Status" />
          <CaseStatusForm caseId={record.id} currentStatus={record.status} />
        </Card>
      </div>

      <Card>
        <CardHeader title="Tracking" subtitle="Sessions linked to this case" />
        {sessions.length === 0 ? (
          <EmptyState title="No tracking sessions" />
        ) : (
          <ul className="divide-y divide-[color:var(--color-panel-border)] text-sm">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-2">
                <Link href={`/tracking/${s.id}`} className="text-accent hover:underline">
                  {s.label}
                </Link>
                <StatusBadge status={s.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader title="Location Evidence" />
        {locations.length === 0 ? (
          <EmptyState title="No location evidence recorded" />
        ) : (
          <ul className="divide-y divide-[color:var(--color-panel-border)] text-sm">
            {locations.map((l) => (
              <li key={l.id} className="flex items-center justify-between py-2">
                <Link href={`/locations/${l.id}`} className="text-accent hover:underline">
                  {l.latitude != null ? `${l.latitude.toFixed(4)}, ${l.longitude?.toFixed(4)}` : "No coordinates"}
                </Link>
                <div className="flex gap-2">
                  <StatusBadge status={l.source} />
                  <StatusBadge status={l.confidence} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader title="Photos" />
        {photos.length === 0 ? (
          <EmptyState title="No photos uploaded" />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {photos.map((p) => (
              <Link
                key={p.id}
                href={`/photos/${p.id}`}
                className="block overflow-hidden rounded-lg border border-[color:var(--color-panel-border)]"
              >
                <img
                  src={`data:${p.mimeType};base64,${p.dataBase64}`}
                  alt={p.originalFilename}
                  className="h-28 w-full object-cover"
                />
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Timeline &amp; Notes" />
        <CaseNoteForm caseId={record.id} />
        <ul className="mt-4 space-y-3">
          {notes.map((n) => (
            <li key={n.id} className="rounded-lg border border-[color:var(--color-panel-border)] p-3 text-sm">
              <p className="text-[color:var(--color-text)]">{n.body}</p>
              <p className="mt-1 text-xs text-[color:var(--color-text-dim)]">
                {n.authorName} · {new Date(n.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader title="Audit" subtitle="Actions tied to this case" />
        {audit.length === 0 ? (
          <EmptyState title="No audit entries" />
        ) : (
          <ul className="space-y-2 text-xs">
            {audit.map((a) => (
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[color:var(--color-panel-border)] p-3">
      <p className="text-[color:var(--color-text-dim)]">{label}</p>
      <p className="font-display text-lg text-accent">{value}</p>
    </div>
  );
}
