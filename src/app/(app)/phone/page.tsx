import type { Metadata } from "next";
import { db } from "@/db";
import { phoneLookups } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { PhoneLookupForm } from "./phone-form";

export const metadata: Metadata = { title: "Phone Intelligence" };
export const dynamic = "force-dynamic";

export default async function PhonePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const history = await db
    .select()
    .from(phoneLookups)
    .orderBy(desc(phoneLookups.createdAt))
    .limit(20);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-xs uppercase tracking-widest text-accent">Intelligence</p>
        <h1 className="mt-1 font-display text-2xl text-[color:var(--color-text)]">Phone Intelligence</h1>
        <p className="mt-2 max-w-2xl text-sm text-[color:var(--color-text-dim)]">
          This tool performs honest number formatting, validation, and country/type parsing
          (E.164) only. It does <strong>not</strong> and will never claim to retrieve live GPS,
          cell tower (BTS/Cell-ID/LAC/TAC), or SS7 subscriber-location data — no such capability
          exists here or anywhere without lawful, authorized telecom access.
        </p>
      </div>

      <Card>
        <CardHeader title="Lookup" />
        <PhoneLookupForm />
      </Card>

      <Card>
        <CardHeader title="Recent Lookups" />
        {history.length === 0 ? (
          <EmptyState title="No lookups yet" />
        ) : (
          <ul className="divide-y divide-[color:var(--color-panel-border)] text-sm">
            {history.map((h) => (
              <li key={h.id} className="flex items-center justify-between py-2">
                <span>{h.rawInput}</span>
                <span className={h.isValid ? "text-accent" : "text-red-400"}>
                  {h.isValid ? h.e164 : "INVALID"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
