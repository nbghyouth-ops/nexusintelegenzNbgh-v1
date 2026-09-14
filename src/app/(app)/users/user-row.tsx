"use client";

import { useTransition } from "react";
import { updateUserRoleAction, toggleUserActiveAction } from "@/lib/actions/users";

const ROLES = ["SUPER_ADMIN", "ADMIN", "OPERATOR", "USER"] as const;

export function UserRow({
  userId,
  role,
  isActive,
  isSelf,
}: {
  userId: string;
  role: string;
  isActive: boolean;
  isSelf: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <select
        name="role"
        defaultValue={role}
        disabled={isSelf || pending}
        className="rounded-lg border border-[color:var(--color-panel-border)] bg-black/40 px-2 py-1 text-xs disabled:opacity-40"
        onChange={(e) => {
          const fd = new FormData();
          fd.set("role", e.target.value);
          startTransition(() => updateUserRoleAction(userId, fd));
        }}
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <button
        disabled={isSelf || pending}
        onClick={() => startTransition(() => toggleUserActiveAction(userId, !isActive))}
        className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase text-[color:var(--color-text-dim)] hover:border-accent hover:text-accent disabled:opacity-40"
      >
        {isActive ? "Deactivate" : "Activate"}
      </button>
    </div>
  );
}
