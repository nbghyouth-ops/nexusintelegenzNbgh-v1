import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PRIVATE_PREFIXES = [
  "/dashboard",
  "/tracking",
  "/locations",
  "/photos",
  "/camera",
  "/cases",
  "/events",
  "/phone",
  "/analytics",
  "/users",
  "/settings",
  "/notifications",
  "/audit",
  "/admin",
  "/t/",
];

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers (defense in depth; see /docs/SECURITY.md)
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(self), camera=(self), microphone=()",
  );
  response.headers.set("X-Frame-Options", "DENY");
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains",
    );
  }
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV !== "production" ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://tiles.openfreemap.org https://*.openfreemap.org",
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
    ].join("; "),
  );

  const path = request.nextUrl.pathname;
  if (PRIVATE_PREFIXES.some((p) => path.startsWith(p))) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
