"use client";

import { useActionState } from "react";
import { addCaseNoteAction } from "@/lib/actions/cases";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/ui/field";

export function CaseNoteForm({ caseId }: { caseId: string }) {
  const action = addCaseNoteAction.bind(null, caseId);
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex gap-2">
      <input name="body" required className={inputClass} placeholder="Add an investigation note…" />
      <Button type="submit" disabled={pending} variant="secondary">
        {pending ? "Adding…" : "Add"}
      </Button>
      {state?.error ? <span className="text-xs text-red-400">{state.error}</span> : null}
    </form>
  );
}
