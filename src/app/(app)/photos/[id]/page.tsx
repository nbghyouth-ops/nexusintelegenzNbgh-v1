import type { Metadata } from "next";
import { db } from "@/db";
import { photoRecords, photoAnalysis, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { LocationMap, googleMapsUrl } from "@/components/map/location-map";
import { DeletePhotoButton } from "./delete-button";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Photo Detail" };

export default async function PhotoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await db
    .select({
      id: photoRecords.id,
      mimeType: photoRecords.mimeType,
      dataBase64: photoRecords.dataBase64,
      originalFilename: photoRecords.originalFilename,
      status: photoRecords.status,
      sizeBytes: photoRecords.sizeBytes,
      createdAt: photoRecords.createdAt,
      uploaderName: users.name,
      hasGps: photoAnalysis.hasGps,
      latitude: photoAnalysis.latitude,
      longitude: photoAnalysis.longitude,
      capturedAt: photoAnalysis.capturedAt,
      cameraMake: photoAnalysis.cameraMake,
      cameraModel: photoAnalysis.cameraModel,
      orientation: photoAnalysis.orientation,
    })
    .from(photoRecords)
    .leftJoin(photoAnalysis, eq(photoAnalysis.photoId, photoRecords.id))
    .leftJoin(users, eq(photoRecords.uploaderId, users.id))
    .where(eq(photoRecords.id, id))
    .limit(1);

  const record = rows[0];
  if (!record) notFound();

  const user = await getCurrentUser();
  const canDelete = user ? hasPermission(user.role, "photos.delete") : false;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader title={record.originalFilename} subtitle={`${(record.sizeBytes / 1024).toFixed(0)} KB · uploaded by ${record.uploaderName ?? "unknown"}`} action={<StatusBadge status={record.status} />} />
        <img src={`data:${record.mimeType};base64,${record.dataBase64}`} alt={record.originalFilename} className="w-full rounded-lg border border-[color:var(--color-panel-border)]" />
        {canDelete ? <div className="mt-4"><DeletePhotoButton photoId={record.id} /></div> : null}
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader title="EXIF Metadata" />
          {record.hasGps ? (
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Detail label="Latitude">{record.latitude?.toFixed(6)}</Detail>
              <Detail label="Longitude">{record.longitude?.toFixed(6)}</Detail>
              <Detail label="Captured At">{record.capturedAt ? new Date(record.capturedAt).toLocaleString() : "—"}</Detail>
              <Detail label="Camera">{[record.cameraMake, record.cameraModel].filter(Boolean).join(" ") || "—"}</Detail>
              <Detail label="Orientation">{record.orientation ?? "—"}</Detail>
            </dl>
          ) : (
            <div className="rounded-lg border border-amber-800/40 bg-amber-500/10 p-3 text-sm text-amber-300">
              LOCATION_UNAVAILABLE — this image contains no embedded GPS metadata.
            </div>
          )}
        </Card>

        {record.hasGps && record.latitude != null && record.longitude != null ? (
          <Card>
            <CardHeader title="Map" />
            <LocationMap points={[{ id: record.id, latitude: record.latitude, longitude: record.longitude, label: "EXIF GPS", confidence: "HIGH" }]} height={280} />
            <a
              href={googleMapsUrl(record.latitude, record.longitude)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block rounded-full border border-accent/40 px-4 py-1.5 font-display text-xs uppercase tracking-wide text-accent hover:bg-[color:var(--color-accent-soft)]"
            >
              Open in Google Maps ↗
            </a>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wide text-[color:var(--color-text-dim)]">{label}</dt>
      <dd className="mt-1 text-[color:var(--color-text)]">{children}</dd>
    </div>
  );
}
