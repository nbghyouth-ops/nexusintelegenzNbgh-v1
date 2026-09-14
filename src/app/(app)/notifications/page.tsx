import type { Metadata } from "next";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { NotificationRow } from "./notification-row";
import { MarkAllButton } from "./mark-all-button";

export const metadata: Metadata = { title: "Notifications" };
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-xs uppercase tracking-widest text-accent">Alerts</p>
          <h1 className="mt-1 font-display text-2xl text-[color:var(--color-text)]">Notifications</h1>
        </div>
        <MarkAllButton />
      </div>
      <Card>
        {rows.length === 0 ? (
          <EmptyState title="No notifications" />
        ) : (
          <ul className="divide-y divide-[color:var(--color-panel-border)]">
            {rows.map((n) => (
              <NotificationRow key={n.id} notification={n} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
