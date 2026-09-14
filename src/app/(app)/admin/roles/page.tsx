import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdmin, PERMISSIONS } from "@/lib/auth/rbac";
import { redirect } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = { title: "Role Management" };

const ROLES = ["SUPER_ADMIN", "ADMIN", "OPERATOR", "USER"] as const;

export default async function RolesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isAdmin(user.role)) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-xs uppercase tracking-widest text-accent">Administration</p>
        <h1 className="mt-1 font-display text-2xl text-[color:var(--color-text)]">Role &amp; Permission Matrix</h1>
        <p className="mt-1 text-sm text-[color:var(--color-text-dim)]">
          Roles are managed per-user on the Users page. This is a read-only reference of what each role can do.
        </p>
      </div>
      <Card>
        <CardHeader title="Permission Matrix" />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[color:var(--color-panel-border)] uppercase tracking-wide text-[color:var(--color-text-dim)]">
                <th className="py-2 pr-4">Permission</th>
                {ROLES.map((r) => (
                  <th key={r} className="px-2 py-2 text-center">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--color-panel-border)]">
              {Object.entries(PERMISSIONS).map(([perm, roles]) => (
                <tr key={perm}>
                  <td className="py-2 pr-4 font-mono">{perm}</td>
                  {ROLES.map((r) => (
                    <td key={r} className="px-2 py-2 text-center">
                      {(roles as readonly string[]).includes(r) ? <span className="text-accent">●</span> : <span className="text-[color:var(--color-text-dim)]">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
