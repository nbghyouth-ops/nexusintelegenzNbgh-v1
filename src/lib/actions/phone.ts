"use server";

import { db } from "@/db";
import { phoneLookups } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { phoneLookupSchema } from "@/lib/validation";
import { analyzePhoneNumber, type PhoneLookupResult } from "@/lib/phone";
import { logAudit } from "@/lib/audit";

export type PhoneActionResult = { error?: string; result?: PhoneLookupResult };

export async function lookupPhoneAction(_prev: PhoneActionResult, formData: FormData): Promise<PhoneActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "AUTH_REQUIRED" };

  const parsed = phoneLookupSchema.safeParse({
    rawInput: formData.get("rawInput"),
    defaultCountry: formData.get("defaultCountry") || undefined,
  });
  if (!parsed.success) return { error: "VALIDATION_ERROR" };

  const result = analyzePhoneNumber(parsed.data.rawInput, parsed.data.defaultCountry);

  await db.insert(phoneLookups).values({
    requesterId: user.id,
    rawInput: parsed.data.rawInput,
    e164: result.e164,
    countryCode: result.countryCode,
    isValid: result.isValid,
    numberType: result.numberType,
  });

  await logAudit({ actorId: user.id, action: "PHONE_LOOKUP", metadata: { valid: result.isValid } });

  return { result };
}
