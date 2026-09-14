import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import Link from "next/link";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="grid-fade relative flex min-h-screen items-center justify-center bg-[color:var(--color-bg)] px-4 py-12">
      <div className="panel panel-glow w-full max-w-md p-8">
        <p className="font-display text-xs uppercase tracking-widest text-accent">Helix Ops</p>
        <h1 className="mt-2 font-display text-2xl text-[color:var(--color-text)]">Operator Sign In</h1>
        <p className="mt-2 text-sm text-[color:var(--color-text-dim)]">
          Access is restricted to authorized case operators. All sign-ins are audit logged.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-[color:var(--color-text-dim)]">
          No account?{" "}
          <Link href="/register" className="text-accent hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
