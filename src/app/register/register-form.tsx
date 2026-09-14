"use client";

import { useActionState } from "react";
import { registerAction, type ActionResult } from "@/lib/actions/auth";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const initialState: ActionResult = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Full name">
        <input name="name" required minLength={2} className={inputClass} placeholder="Jane Operator" />
      </Field>
      <Field label="Email">
        <input name="email" type="email" required autoComplete="email" className={inputClass} placeholder="you@organization.com" />
      </Field>
      <Field label="Password" hint="At least 8 characters.">
        <input name="password" type="password" required minLength={8} autoComplete="new-password" className={inputClass} placeholder="••••••••" />
      </Field>
      {state?.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating account…" : "Create Account"}
      </Button>
    </form>
  );
}
