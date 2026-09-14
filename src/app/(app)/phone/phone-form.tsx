"use client";

import { useActionState } from "react";
import { lookupPhoneAction, type PhoneActionResult } from "@/lib/actions/phone";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function PhoneLookupForm() {
  const [state, formAction, pending] = useActionState<PhoneActionResult, FormData>(lookupPhoneAction, {});

  return (
    <div className="space-y-4">
      <form action={formAction} className="grid gap-4 sm:grid-cols-3">
        <Field label="Phone number">
          <input name="rawInput" required className={inputClass} placeholder="+1 555 0100 or 0812xxxxxxx" />
        </Field>
        <Field label="Default country (ISO 2-letter, optional)">
          <input name="defaultCountry" maxLength={2} className={inputClass} placeholder="US" />
        </Field>
        <div className="flex items-end">
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Checking…" : "Analyze"}
          </Button>
        </div>
      </form>
      {state?.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
      {state?.result ? (
        <div className="rounded-lg border border-[color:var(--color-panel-border)] bg-black/30 p-4 text-sm">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <dt className="text-[10px] uppercase text-[color:var(--color-text-dim)]">Valid</dt>
              <dd className={state.result.isValid ? "text-accent" : "text-red-400"}>{String(state.result.isValid)}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase text-[color:var(--color-text-dim)]">E.164</dt>
              <dd>{state.result.e164 ?? "UNAVAILABLE"}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase text-[color:var(--color-text-dim)]">Country</dt>
              <dd>{state.result.countryCode ?? "UNAVAILABLE"}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase text-[color:var(--color-text-dim)]">Type</dt>
              <dd>{state.result.numberType ?? "UNAVAILABLE"}</dd>
            </div>
          </dl>
        </div>
      ) : null}
    </div>
  );
}
