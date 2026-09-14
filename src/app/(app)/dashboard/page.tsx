import type { Metadata } from "next";
import { db } from "@/db";
import { cases, trackingSessions, trackingVisits, locationEvidence, photoRecords, cameraSessions, notifications, auditLogs } from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Card, CardHeader, StatCard, EmptyState } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [caseCount] = await db.select({ count: sql<number>`count(*)::int` }).from(cases);
  const [activeSessions] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(trackingSessions)
    .where(eq(trackingSessions.status, "ACTIVE"));
  const [visitCount] = await db.select({ count: sql<number>`count(*)::int` }).from(trackingVisits);
  const [locationCount] = await db.select({ count: sql<number>`count(*)::int` }).from(locationEvidence);
  const [photoCount] = await db.select({ count: sql<number>`count(*)::int` }).from(photoRecords);
  const [cameraCount] = await db.select({ count: sql<number>`count(*)::int` }).from(cameraSessions);
  const [unreadNotifications] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false)));

  const recentVisits = await db
    .select({
      id: trackingVisits.id,
      occurredAt: trackingVisits.occurredAt,
      deviceType: trackingVisits.deviceType,
      browser: trackingVisits.browser,
      sessionId: trackingVisits.sessionId,
      label: trackingSessions.label,
    })
    .from(trackingVisits)
    .innerJoin(trackingSessions, eq(trackingVisits.sessionId, trackingSessions.id))
    .orderBy(desc(trackingVisits.occurredAt))
    .limit(6);

  const recentLocations = await db
    .select()
    .from(locationEvidence)
    .orderBy(desc(locationEvidence.receivedAt))
    .limit(5);

  const recentAudit = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(8);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-xs uppercase tracking-widest text-accent">Overview</p>
          <h1 className="mt-1 font-display text-2xl text-[color:var(--color-text)]">Operations Dashboard</h1>
        </div>
        <LinkButton href="/tracking/new">+ New Tracking Session</LinkButton>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Cases" value={caseCount?.count ?? 0} />
        <StatCard label="Active Sessions" value={activeSessions?.count ?? 0} />
        <StatCard label="Recorded Visits" value={visitCount?.count ?? 0} />
        <StatCard label="Location Evidence" value={locationCount?.count ?? 0} />
        <StatCard label="Photo Records" value={photoCount?.count ?? 0} />
        <StatCard label="Camera Sessions" value={cameraCount?.count ?? 0} />
        <StatCard label="Unread Alerts" value={unreadNotifications?.count ?? 0} />
        <StatCard label="System Health" value="OK" hint="Database reachable" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Recent Tracking Visits" subtitle="Ordinary request metadata only — not device GPS" />
          {recentVisits.length === 0 ? (
            <EmptyState title="No visits yet" description="Visits appear once someone opens a tracking link." />
          ) : (
            <ul className="divide-y divide-[color:var(--color-panel-border)]">
              {recentVisits.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="text-[color:var(--color-text)]">{v.label}</p>
                    <p className="text-xs text-[color:var(--color-text-dim)]">
                      {v.deviceType ?? "unknown"} · {v.browser ?? "unknown"}
                    </p>
                  </div>
                  <p className="text-xs text-[color:var(--color-text-dim)]">
                    {new Date(v.occurredAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Latest Location Evidence" subtitle="Source &amp; confidence" />
          {recentLocations.length === 0 ? (
            <EmptyState title="No evidence yet" />
          ) : (
            <ul className="space-y-3">
              {recentLocations.map((l) => (
                <li key={l.id} className="rounded-lg border border-[color:var(--color-panel-border)] p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[color:var(--color-text)]">{l.source.replace(/_/g, " ")}</span>
                    <StatusBadge status={l.confidence} />
                  </div>
                  <p className="mt-1 text-[color:var(--color-text-dim)]">
                    {l.latitude != null ? `${l.latitude.toFixed(4)}, ${l.longitude?.toFixed(4)}` : "No coordinates"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Recent Activity Timeline" subtitle="Audit trail (latest 8 events)" />
        {recentAudit.length === 0 ? (
          <EmptyState title="No activity recorded" />
        ) : (
          <ul className="space-y-2">
            {recentAudit.map((a) => (
              <li key={a.id} className="flex items-center justify-between text-xs">
                <span className="font-display text-accent">{a.action}</span>
                <span className="text-[color:var(--color-text-dim)]">{new Date(a.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 text-right">
          <Link href="/audit" className="text-xs text-accent hover:underline">
            View full audit log →
          </Link>
        </div>
      </Card>
    </div>
  );
}
