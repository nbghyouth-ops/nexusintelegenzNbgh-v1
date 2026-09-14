import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Helix Ops — Consent-Aware Location Intelligence",
    template: "%s · Helix Ops",
  },
  description:
    "Helix Ops is a consent-aware location intelligence, verification, and evidence management platform.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
