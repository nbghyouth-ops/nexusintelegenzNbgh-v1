"use client";

import { useActionState } from "react";
import { uploadPhotoAction, type ActionResult } from "@/lib/actions/photos";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function UploadForm({ cases }: { cases: { id: string; caseNumber: string; title: string }[] }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(uploadPhotoAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Case (optional)">
        <select name="caseId" defaultValue="" className={inputClass}>
          <option value="">No case</option>
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.caseNumber} — {c.title}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Image file">
        <input name="file" type="file" accept="image/jpeg,image/png,image/webp" required className={inputClass} />
      </Field>
      {state?.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Uploading…" : "Upload & Analyze"}
      </Button>
    </form>
  );
}
