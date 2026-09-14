import type { Metadata } from "next";
import { db } from "@/db";
import { cases, trackingSessions, trackingVisits, locationEvidence, photoRecords, cameraSessions, consents } from "@/db/schema";
import { sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/rbac";
import { redirect } from "next/navigation";
import { Card, CardHeader, StatCard } from "@/components/ui/card";

export const metadata: Metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.role, "analytics.read")) redirect("/dashboard");

  const [caseCount] = await db.select({ count: sql<number>`count(*)::int` }).from(cases);
  const [sessionCount] = await db.select({ count: sql<number>`count(*)::int` }).from(trackingSessions);
  const [visitCount] = await db.select({ count: sql<number>`count(*)::int` }).from(trackingVisits);
  const [locationCount] = await db.select({ count: sql<number>`count(*)::int` }).from(locationEvidence);
  const [photoCount] = await db.select({ count: sql<number>`count(*)::int` }).from(photoRecords);
  const [cameraCount] = await db.select({ count: sql<number>`count(*)::int` }).from(cameraSessions);

  const consentBreakdown = await db
    .select({ status: consents.status, count: sql<number>`count(*)::int` })
    .from(consents)
    .groupBy(consents.status);

  const confidenceBreakdown = await db
    .select({ confidence: locationEvidence.confidence, count: sql<number>`count(*)::int` })
    .from(locationEvidence)
    .groupBy(locationEvidence.confidence);

  const casesByStatus = await db
    .select({ status: cases.status, count: sql<number>`count(*)::int` })
    .from(cases)
    .groupBy(cases.status);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-xs uppercase tracking-widest text-accent">Insights</p>
        <h1 className="mt-1 font-display text-2xl text-[color:var(--color-text)]">Analytics</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <StatCard label="Cases" value={caseCount?.count ?? 0} />
        <StatCard label="Tracking Sessions" value={sessionCount?.count ?? 0} />
        <StatCard label="Visits" value={visitCount?.count ?? 0} />
        <StatCard label="Locations" value={locationCount?.count ?? 0} />
        <StatCard label="Photos" value={photoCount?.count ?? 0} />
        <StatCard label="Camera Sessions" value={cameraCount?.count ?? 0} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Breakdown title="Cases by Status" rows={casesByStatus.map((r) => ({ label: r.status, value: r.count }))} />
        <Breakdown title="Consent Outcomes" rows={consentBreakdown.map((r) => ({ label: r.status, value: r.count }))} />
        <Breakdown title="Location Confidence" rows={confidenceBreakdown.map((r) => ({ label: r.confidence, value: r.count }))} />
      </div>
    </div>
  );
}

function Breakdown({ title, rows }: { title: string; rows: { label: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <Card>
      <CardHeader title={title} />
      {rows.length === 0 ? (
        <p className="text-sm text-[color:var(--color-text-dim)]">No data yet.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.label} className="text-xs">
              <div className="mb-1 flex justify-between text-[color:var(--color-text-dim)]">
                <span>{r.label}</span>
                <span>{r.value}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5">
                <div className="h-1.5 rounded-full bg-accent" style={{ width: `${(r.value / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
