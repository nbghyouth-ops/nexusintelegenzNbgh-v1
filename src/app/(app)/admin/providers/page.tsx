import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/rbac";
import { redirect } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Provider Status" };

const PROVIDERS = [
  { name: "Browser Geolocation API", status: "AVAILABLE", detail: "Native browser capability, no external dependency." },
  { name: "Browser Camera (getUserMedia)", status: "AVAILABLE", detail: "Native browser capability, no external dependency." },
  { name: "EXIF Extraction (exifr)", status: "AVAILABLE", detail: "Local, open-source, no network calls." },
  { name: "Map Tiles (OpenFreeMap)", status: "AVAILABLE", detail: "Free tile provider; replaceable via NEXT_PUBLIC_MAP_STYLE_URL." },
  { name: "Cell/Wi-Fi Location Provider", status: "UNAVAILABLE", detail: "No provider configured. This system never fabricates cell/Wi-Fi based location." },
  { name: "SS7 / Telecom Subscriber Location", status: "NOT_IMPLEMENTED", detail: "Intentionally not implemented. Requires lawful, authorized telecom access that this product does not provide." },
  { name: "Email Delivery Provider", status: "UNAVAILABLE", detail: "No transactional email provider configured (optional, zero-cost MVP)." },
  { name: "Vision / OCR Provider", status: "UNAVAILABLE", detail: "Optional future integration. Any output would be labeled ESTIMATED, never VERIFIED." },
];

export default async function ProvidersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isAdmin(user.role)) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-xs uppercase tracking-widest text-accent">Administration</p>
        <h1 className="mt-1 font-display text-2xl text-[color:var(--color-text)]">Provider Status</h1>
      </div>
      <Card>
        <CardHeader title="External & Native Providers" />
        <ul className="divide-y divide-[color:var(--color-panel-border)]">
          {PROVIDERS.map((p) => (
            <li key={p.name} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p>{p.name}</p>
                <p className="text-xs text-[color:var(--color-text-dim)]">{p.detail}</p>
              </div>
              <Badge tone={p.status === "AVAILABLE" ? "accent" : p.status === "UNAVAILABLE" ? "warn" : "neutral"}>{p.status}</Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
