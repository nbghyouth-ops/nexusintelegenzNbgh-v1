"use client";

import { useActionState } from "react";
import { requestPasswordResetAction, type ResetResult } from "@/lib/actions/password-reset";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<ResetResult, FormData>(requestPasswordResetAction, {});

  if (state?.success) {
    return (
      <div className="space-y-3 text-sm">
        <p className="text-accent">If an account exists for that email, a reset link has been generated.</p>
        {state.devResetLink ? (
          <a href={state.devResetLink} className="block break-all rounded-lg border border-accent/40 bg-black/30 p-3 text-accent hover:underline">
            {state.devResetLink}
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Email">
        <input name="email" type="email" required className={inputClass} placeholder="you@organization.com" />
      </Field>
      {state?.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Sending…" : "Send Reset Link"}
      </Button>
    </form>
  );
}
