import { parsePhoneNumberFromString } from "libphonenumber-js";

export type PhoneLookupResult = {
  rawInput: string;
  isValid: boolean;
  e164: string | null;
  countryCode: string | null;
  numberType: string | null;
};

/**
 * Legitimate, honest phone number utility: format validation and
 * normalization only. This intentionally does NOT and NEVER WILL claim to
 * retrieve live GPS coordinates, cell tower (BTS/Cell-ID/LAC/TAC), or SS7
 * subscriber-location data from a phone number. No such capability is
 * implemented anywhere in this codebase.
 */
export function analyzePhoneNumber(
  rawInput: string,
  defaultCountry?: string,
): PhoneLookupResult {
  try {
    const parsed = parsePhoneNumberFromString(
      rawInput,
      defaultCountry as never,
    );
    if (!parsed) {
      return {
        rawInput,
        isValid: false,
        e164: null,
        countryCode: null,
        numberType: null,
      };
    }
    return {
      rawInput,
      isValid: parsed.isValid(),
      e164: parsed.isValid() ? parsed.number : null,
      countryCode: parsed.country ?? null,
      numberType: parsed.getType() ?? null,
    };
  } catch {
    return {
      rawInput,
      isValid: false,
      e164: null,
      countryCode: null,
      numberType: null,
    };
  }
}
