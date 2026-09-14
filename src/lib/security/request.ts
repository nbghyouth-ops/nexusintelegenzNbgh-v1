import type { NextRequest } from "next/server";

/** Extracts a best-effort client IP from standard proxy headers (Vercel-compatible). */
export function getClientIp(req: NextRequest | Request): string | null {
  const headers = req.headers;
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  const real = headers.get("x-real-ip");
  if (real) return real;
  return null;
}

export type DeviceInfo = {
  deviceType: string;
  browser: string;
  os: string;
};

/**
 * Extremely lightweight user-agent classifier. This intentionally avoids
 * fingerprinting beyond coarse categories (device/browser/os family) and
 * never attempts to uniquely identify a person.
 */
export function classifyUserAgent(ua: string | null | undefined): DeviceInfo {
  const s = (ua || "").toLowerCase();
  let deviceType = "desktop";
  if (/mobile|iphone|android.*mobile/.test(s)) deviceType = "mobile";
  else if (/ipad|tablet/.test(s)) deviceType = "tablet";

  let browser = "unknown";
  if (s.includes("edg/")) browser = "edge";
  else if (s.includes("chrome/") && !s.includes("chromium")) browser = "chrome";
  else if (s.includes("firefox/")) browser = "firefox";
  else if (s.includes("safari/") && !s.includes("chrome")) browser = "safari";

  let os = "unknown";
  if (s.includes("windows")) os = "windows";
  else if (s.includes("mac os")) os = "macos";
  else if (s.includes("android")) os = "android";
  else if (s.includes("iphone") || s.includes("ipad")) os = "ios";
  else if (s.includes("linux")) os = "linux";

  return { deviceType, browser, os };
}
