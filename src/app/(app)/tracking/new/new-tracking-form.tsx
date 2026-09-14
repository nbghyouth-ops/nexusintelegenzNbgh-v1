"use client";

import { useActionState, useState } from "react";
import { createTrackingSessionAction, type CreateTrackingResult } from "@/lib/actions/tracking";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export function NewTrackingForm({ cases }: { cases: { id: string; caseNumber: string; title: string }[] }) {
  const [state, formAction, pending] = useActionState<CreateTrackingResult, FormData>(
    createTrackingSessionAction,
    {},
  );
  const [link, setLink] = useState<string | null>(null);

  useEffect(() => {
    if (state?.token) {
      setLink(`${window.location.origin}/t/${state.token}`);
    }
  }, [state?.token]);

  if (link) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-accent">Session created. Copy this link now — it will not be shown again.</p>
        <div className="flex items-center gap-2 rounded-lg border border-accent/40 bg-black/40 p-3">
          <code className="flex-1 truncate text-xs text-[color:var(--color-text)]">{link}</code>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigator.clipboard.writeText(link)}
          >
            Copy
          </Button>
        </div>
        <a href={`/tracking/${state.sessionId}`} className="text-sm text-accent hover:underline">
          Go to session detail →
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Label">
        <input name="label" required className={inputClass} placeholder="Delivery confirmation link" />
      </Field>
      <Field label="Purpose (shown to the recipient)">
        <textarea
          name="purpose"
          required
          rows={3}
          className={inputClass}
          placeholder="Explain honestly why this link exists and what it will ask for."
        />
      </Field>
      <Field label="Linked case (optional)">
        <select name="caseId" className={inputClass} defaultValue="">
          <option value="">No case</option>
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.caseNumber} — {c.title}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="requiresLocation" defaultChecked className="accent-[--color-accent]" />
          Request location
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="requiresCamera" className="accent-[--color-accent]" />
          Request camera
        </label>
      </div>
      <Field label="Expires in (hours)">
        <input name="expiresInHours" type="number" min={1} max={720} defaultValue={72} className={inputClass} />
      </Field>
      {state?.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating…" : "Generate Tracking Link"}
      </Button>
    </form>
  );
}
