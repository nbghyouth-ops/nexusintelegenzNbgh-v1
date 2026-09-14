"use client";

import { useActionState } from "react";
import { updateCaseAction } from "@/lib/actions/cases";
import { Button } from "@/components/ui/button";

const STATUSES = ["OPEN", "PROCESSING", "COMPLETED", "ARCHIVED", "CANCELLED"] as const;

export function CaseStatusForm({ caseId, currentStatus }: { caseId: string; currentStatus: string }) {
  const action = updateCaseAction.bind(null, caseId);
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-3">
      <select
        name="status"
        defaultValue={currentStatus}
        className="w-full rounded-lg border border-[color:var(--color-panel-border)] bg-black/40 px-3 py-2 text-sm outline-none focus:border-accent"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {state?.error ? <p className="text-xs text-red-400">{state.error}</p> : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Saving…" : "Save Status"}
      </Button>
    </form>
  );
}
