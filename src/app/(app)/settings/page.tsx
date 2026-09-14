import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/rbac";
import { redirect } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/card";
import { getGlobalSettings } from "@/lib/actions/settings";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const canManage = hasPermission(user.role, "settings.manage");
  const settings = await getGlobalSettings();

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-xs uppercase tracking-widest text-accent">Configuration</p>
        <h1 className="mt-1 font-display text-2xl text-[color:var(--color-text)]">Settings</h1>
      </div>
      <Card>
        <CardHeader title="Data Retention & Feature Flags" subtitle={canManage ? undefined : "Read-only — Admin role required to change"} />
        <SettingsForm settings={settings} readOnly={!canManage} />
      </Card>
      <Card>
        <CardHeader title="Account" />
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-[10px] uppercase text-[color:var(--color-text-dim)]">Name</dt>
            <dd>{user.name}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase text-[color:var(--color-text-dim)]">Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase text-[color:var(--color-text-dim)]">Role</dt>
            <dd>{user.role}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
