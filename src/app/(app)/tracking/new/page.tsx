import type { Metadata } from "next";
import { db } from "@/db";
import { cases } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Card, CardHeader } from "@/components/ui/card";
import { NewTrackingForm } from "./new-tracking-form";

export const metadata: Metadata = { title: "New Tracking Session" };
export const dynamic = "force-dynamic";

export default async function NewTrackingPage() {
  const availableCases = await db
    .select({ id: cases.id, caseNumber: cases.caseNumber, title: cases.title })
    .from(cases)
    .orderBy(desc(cases.createdAt))
    .limit(50);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="font-display text-xs uppercase tracking-widest text-accent">Verification</p>
        <h1 className="mt-1 font-display text-2xl text-[color:var(--color-text)]">New Tracking Session</h1>
        <p className="mt-2 text-sm text-[color:var(--color-text-dim)]">
          The generated link will truthfully disclose its purpose and any sensitive permission it
          requests. No location or camera data is ever collected without explicit, informed consent.
        </p>
      </div>
      <Card>
        <CardHeader title="Session Details" />
        <NewTrackingForm cases={availableCases} />
      </Card>
    </div>
  );
}
