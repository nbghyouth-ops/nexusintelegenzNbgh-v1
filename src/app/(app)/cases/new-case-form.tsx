"use client";

import { useActionState, useState } from "react";
import { createCaseAction } from "@/lib/actions/cases";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function NewCaseForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createCaseAction, {});

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        + New Case
      </Button>
    );
  }

  return (
    <Card>
      <form action={formAction} className="grid gap-4 sm:grid-cols-2">
        <Field label="Title">
          <input name="title" required className={inputClass} placeholder="Unauthorized access investigation" />
        </Field>
        <Field label="Description (optional)">
          <input name="description" className={inputClass} placeholder="Short summary" />
        </Field>
        {state?.error ? <p className="text-sm text-red-400 sm:col-span-2">{state.error}</p> : null}
        <div className="flex gap-2 sm:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Creating…" : "Create Case"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
