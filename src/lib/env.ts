// Centralized, typed environment variable access.
// Distinguishes public (browser-exposed) vs server-only vs optional variables.

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  // Public (safe to expose to the browser bundle via NEXT_PUBLIC_ prefix)
  public: {
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    mapStyleUrl:
      process.env.NEXT_PUBLIC_MAP_STYLE_URL ||
      "https://tiles.openfreemap.org/styles/dark",
  },
  // Server-only (never import this into a "use client" component)
  server: {
    databaseUrl: () => required("DATABASE_URL", process.env.DATABASE_URL),
    sessionSecret: () =>
      process.env.SESSION_SECRET ||
      "dev-only-insecure-secret-change-in-production",
    nodeEnv: process.env.NODE_ENV || "development",
  },
};

export const isProduction = process.env.NODE_ENV === "production";
