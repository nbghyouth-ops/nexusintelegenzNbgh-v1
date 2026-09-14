import type { Metadata } from "next";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Reset password" };

export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <main className="grid-fade flex min-h-screen items-center justify-center bg-[color:var(--color-bg)] px-4 py-12">
      <div className="panel panel-glow w-full max-w-md p-8">
        <p className="font-display text-xs uppercase tracking-widest text-accent">Helix Ops</p>
        <h1 className="mt-2 font-display text-2xl text-[color:var(--color-text)]">Choose a new password</h1>
        <div className="mt-6">
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </main>
  );
}
