import type { Metadata } from "next";
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/rbac";
import { redirect } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { UserRow } from "./user-row";

export const metadata: Metadata = { title: "Users" };
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const current = await getCurrentUser();
  if (!current) redirect("/login");
  if (!hasPermission(current.role, "users.read")) redirect("/dashboard");

  const rows = await db.select().from(users).orderBy(desc(users.createdAt)).limit(100);
  const canManage = hasPermission(current.role, "users.manage");

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-xs uppercase tracking-widest text-accent">Access Control</p>
        <h1 className="mt-1 font-display text-2xl text-[color:var(--color-text)]">Users</h1>
      </div>
      <Card>
        <CardHeader title="All Users" />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[color:var(--color-panel-border)] text-[10px] uppercase tracking-wide text-[color:var(--color-text-dim)]">
                <th className="pb-2">Name</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Role</th>
                <th className="pb-2">Active</th>
                {canManage ? <th className="pb-2">Actions</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--color-panel-border)]">
              {rows.map((u) => (
                <tr key={u.id}>
                  <td className="py-3">{u.name}</td>
                  <td className="py-3 text-[color:var(--color-text-dim)]">{u.email}</td>
                  <td className="py-3">
                    <StatusBadge status={u.role} />
                  </td>
                  <td className="py-3">{u.isActive ? "Yes" : "No"}</td>
                  {canManage ? (
                    <td className="py-3">
                      <UserRow userId={u.id} role={u.role} isActive={u.isActive} isSelf={u.id === current.id} />
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
