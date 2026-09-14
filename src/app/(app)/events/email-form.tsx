"use client";

import { useActionState } from "react";
import { createEmailTrackingAction, type ActionResult } from "@/lib/actions/email";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function EmailTrackingForm() {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(createEmailTrackingAction, {});

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-3">
      <Field label="Target email">
        <input name="targetEmail" type="email" required className={inputClass} placeholder="recipient@example.com" />
      </Field>
      <Field label="Subject (optional)">
        <input name="subject" className={inputClass} placeholder="Invoice #123" />
      </Field>
      <div className="flex items-end">
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Creating…" : "Create Pixel"}
        </Button>
      </div>
      {state?.error ? <p className="text-sm text-red-400 sm:col-span-3">{state.error}</p> : null}
    </form>
  );
}
