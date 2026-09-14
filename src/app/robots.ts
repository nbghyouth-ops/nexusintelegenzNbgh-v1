import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: ["/", "/privacy", "/terms", "/consent", "/login", "/register"], disallow: ["/dashboard", "/tracking", "/t/", "/locations", "/photos", "/camera", "/cases", "/events", "/phone", "/analytics", "/users", "/settings", "/notifications", "/audit", "/admin", "/api"] },
    ],
    sitemap: `${env.public.appUrl}/sitemap.xml`,
  };
}
