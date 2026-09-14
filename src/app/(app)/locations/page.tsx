import type { Metadata } from "next";
import { db } from "@/db";
import { locationEvidence, trackingSessions } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { LocationMap } from "@/components/map/location-map";
import Link from "next/link";

export const metadata: Metadata = { title: "Locations" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function LocationsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(locationEvidence);

  const rows = await db
    .select({
      id: locationEvidence.id,
      latitude: locationEvidence.latitude,
      longitude: locationEvidence.longitude,
      source: locationEvidence.source,
      confidence: locationEvidence.confidence,
      status: locationEvidence.status,
      receivedAt: locationEvidence.receivedAt,
      label: trackingSessions.label,
    })
    .from(locationEvidence)
    .leftJoin(trackingSessions, eq(locationEvidence.trackingSessionId, trackingSessions.id))
    .orderBy(desc(locationEvidence.receivedAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const mapPoints = rows
    .filter((r) => r.latitude != null && r.longitude != null)
    .map((r) => ({ id: r.id, latitude: r.latitude!, longitude: r.longitude!, label: r.label ?? "Evidence", confidence: r.confidence }));

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-xs uppercase tracking-widest text-accent">Evidence</p>
        <h1 className="mt-1 font-display text-2xl text-[color:var(--color-text)]">Location Evidence</h1>
      </div>

      <Card>
        <CardHeader title="Map" subtitle="All coordinates from this page" />
        <LocationMap points={mapPoints} />
      </Card>

      <Card>
        <CardHeader title="Records" />
        {rows.length === 0 ? (
          <EmptyState title="No location evidence yet" description="Location evidence appears once a tracking recipient grants location permission, or a photo with EXIF GPS is uploaded." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[color:var(--color-panel-border)] text-[10px] uppercase tracking-wide text-[color:var(--color-text-dim)]">
                  <th className="pb-2">Coordinates</th>
                  <th className="pb-2">Source</th>
                  <th className="pb-2">Confidence</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--color-panel-border)]">
                {rows.map((l) => (
                  <tr key={l.id} className="hover:bg-white/[0.02]">
                    <td className="py-3">
                      <Link href={`/locations/${l.id}`} className="text-accent hover:underline">
                        {l.latitude != null ? `${l.latitude.toFixed(5)}, ${l.longitude?.toFixed(5)}` : "No coordinates"}
                      </Link>
                    </td>
                    <td className="py-3">
                      <StatusBadge status={l.source} />
                    </td>
                    <td className="py-3">
                      <StatusBadge status={l.confidence} />
                    </td>
                    <td className="py-3">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="py-3 text-[color:var(--color-text-dim)]">{new Date(l.receivedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination basePath="/locations" page={page} pageSize={PAGE_SIZE} total={count ?? 0} />
      </Card>
    </div>
  );
}
