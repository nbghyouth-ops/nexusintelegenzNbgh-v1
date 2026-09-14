import type { Metadata } from "next";
import { db } from "@/db";
import { emailTrackingSessions, emailTrackingEvents } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { EmailTrackingForm } from "./email-form";

export const metadata: Metadata = { title: "Email / Events" };
export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sessions = await db
    .select({
      id: emailTrackingSessions.id,
      targetEmail: emailTrackingSessions.targetEmail,
      subject: emailTrackingSessions.subject,
      pixelToken: emailTrackingSessions.pixelToken,
      createdAt: emailTrackingSessions.createdAt,
      openCount: sql<number>`(select count(*)::int from ${emailTrackingEvents} where ${emailTrackingEvents.sessionId} = ${emailTrackingSessions.id})`,
    })
    .from(emailTrackingSessions)
    .where(eq(emailTrackingSessions.creatorId, user.id))
    .orderBy(desc(emailTrackingSessions.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-xs uppercase tracking-widest text-accent">Communications</p>
        <h1 className="mt-1 font-display text-2xl text-[color:var(--color-text)]">Email / Events</h1>
        <p className="mt-2 max-w-2xl text-sm text-[color:var(--color-text-dim)]">
          Generates a disclosed open-tracking pixel you embed in outgoing email. An "open signal"
          only means an image request was made by the recipient&apos;s mail client — this is not
          proof of who opened it or their exact location, and is reported honestly as such.
        </p>
      </div>

      <Card>
        <CardHeader title="Create Tracking Pixel" />
        <EmailTrackingForm />
      </Card>

      <Card>
        <CardHeader title="Active Sessions" />
        {sessions.length === 0 ? (
          <EmptyState title="No tracking sessions" description="Belum ada sesi tracking." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[color:var(--color-panel-border)] text-[10px] uppercase tracking-wide text-[color:var(--color-text-dim)]">
                  <th className="pb-2">Target</th>
                  <th className="pb-2">Subject</th>
                  <th className="pb-2">Open Signals</th>
                  <th className="pb-2">Pixel Tag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--color-panel-border)]">
                {sessions.map((s) => (
                  <tr key={s.id}>
                    <td className="py-3">{s.targetEmail}</td>
                    <td className="py-3 text-[color:var(--color-text-dim)]">{s.subject ?? "—"}</td>
                    <td className="py-3">{s.openCount}</td>
                    <td className="py-3">
                      <code className="text-xs text-[color:var(--color-text-dim)]">
                        {`<img src="/api/pixel/${s.pixelToken}" width="1" height="1" />`}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
