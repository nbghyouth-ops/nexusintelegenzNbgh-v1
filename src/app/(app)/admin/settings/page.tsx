import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/rbac";
import { redirect } from "next/navigation";
import { getGlobalSettings } from "@/lib/actions/settings";
import { SettingsForm } from "@/app/(app)/settings/settings-form";
import { Card, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = { title: "Advanced Settings" };
export const dynamic = "force-dynamic";

export default async function AdvancedSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isAdmin(user.role)) redirect("/dashboard");

  const settings = await getGlobalSettings();

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-xs uppercase tracking-widest text-accent">Administration</p>
        <h1 className="mt-1 font-display text-2xl text-[color:var(--color-text)]">Advanced Settings</h1>
      </div>
      <Card>
        <CardHeader title="Global Retention &amp; Feature Flags" />
        <SettingsForm settings={settings} readOnly={user.role !== "SUPER_ADMIN"} />
      </Card>
    </div>
  );
}
