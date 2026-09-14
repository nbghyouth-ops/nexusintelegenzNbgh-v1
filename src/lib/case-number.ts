import "server-only";
import { db } from "@/db";
import { caseNumberSeq } from "@/db/schema";
import { sql } from "drizzle-orm";

/** Generates the next sequential, zero-padded case number, e.g. CASE-000001. */
export async function nextCaseNumber(): Promise<string> {
  const rows = await db
    .insert(caseNumberSeq)
    .values({})
    .returning({ id: caseNumberSeq.id });
  const id = rows[0]!.id;
  return `CASE-${String(id).padStart(6, "0")}`;
}

// Ensures the identity sequence exists even if the row itself isn't needed.
export const _unused = sql`select 1`;
