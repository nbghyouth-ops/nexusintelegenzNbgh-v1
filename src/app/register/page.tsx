import type { Metadata } from "next";
import { RegisterForm } from "./register-form";
import Link from "next/link";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <main className="grid-fade relative flex min-h-screen items-center justify-center bg-[color:var(--color-bg)] px-4 py-12">
      <div className="panel panel-glow w-full max-w-md p-8">
        <p className="font-display text-xs uppercase tracking-widest text-accent">Helix Ops</p>
        <h1 className="mt-2 font-display text-2xl text-[color:var(--color-text)]">Create Operator Account</h1>
        <p className="mt-2 text-sm text-[color:var(--color-text-dim)]">
          The first registered account becomes the Super Admin. Subsequent accounts start as
          standard users pending role assignment.
        </p>
        <div className="mt-6">
          <RegisterForm />
        </div>
        <p className="mt-6 text-center text-xs text-[color:var(--color-text-dim)]">
          Already registered?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
