import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/rbac";
import { redirect } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminHome() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isAdmin(user.role)) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-xs uppercase tracking-widest text-accent">Administration</p>
        <h1 className="mt-1 font-display text-2xl text-[color:var(--color-text)]">Admin Overview</h1>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminCard href="/admin/health" title="System Health" desc="Database, auth, and environment checks" />
        <AdminCard href="/admin/providers" title="Provider Status" desc="Optional external provider availability" />
        <AdminCard href="/admin/roles" title="Role Management" desc="Permission matrix reference" />
        <AdminCard href="/admin/settings" title="Advanced Settings" desc="Retention & feature flags" />
        <AdminCard href="/users" title="Users" desc="Manage accounts & roles" />
        <AdminCard href="/audit" title="Audit Logs" desc="Full activity trail" />
        <AdminCard href="/cases" title="Cases" desc="All case records" />
        <AdminCard href="/tracking" title="Tracking" desc="All tracking sessions" />
      </div>
    </div>
  );
}

function AdminCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Card>
      <CardHeader title={title} subtitle={desc} />
      <LinkButton href={href} variant="secondary">
        Open
      </LinkButton>
    </Card>
  );
}
