"use client";

import { useActionState } from "react";
import { resetPasswordAction, type ResetResult } from "@/lib/actions/password-reset";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ResetPasswordForm({ token }: { token: string }) {
  const action = resetPasswordAction.bind(null, token);
  const [state, formAction, pending] = useActionState<ResetResult, FormData>(action, {});

  if (state?.success) {
    return (
      <div className="space-y-3 text-sm">
        <p className="text-accent">Password updated. You may now sign in.</p>
        <Link href="/login" className="inline-block rounded-full bg-accent px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide text-black">
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <Field label="New password" hint="At least 8 characters.">
        <input name="password" type="password" required minLength={8} className={inputClass} />
      </Field>
      {state?.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Saving…" : "Update Password"}
      </Button>
    </form>
  );
}
