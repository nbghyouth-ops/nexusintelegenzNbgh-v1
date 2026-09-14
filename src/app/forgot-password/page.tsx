import type { Metadata } from "next";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <main className="grid-fade flex min-h-screen items-center justify-center bg-[color:var(--color-bg)] px-4 py-12">
      <div className="panel panel-glow w-full max-w-md p-8">
        <p className="font-display text-xs uppercase tracking-widest text-accent">Helix Ops</p>
        <h1 className="mt-2 font-display text-2xl text-[color:var(--color-text)]">Reset your password</h1>
        <p className="mt-2 text-sm text-[color:var(--color-text-dim)]">
          Enter your account email. No email provider is configured in this MVP, so a reset link
          is shown directly here — in production this would be emailed instead.
        </p>
        <div className="mt-6">
          <ForgotPasswordForm />
        </div>
      </div>
    </main>
  );
}
