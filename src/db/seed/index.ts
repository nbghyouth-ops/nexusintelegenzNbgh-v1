// Development/bootstrap seed script.
// Usage: npx tsx src/db/seed/index.ts
// Creates a single SUPER_ADMIN account so the application can be accessed
// on a fresh database. Safe to re-run (idempotent on email).
import "dotenv/config";
import { db, pool } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { eq } from "drizzle-orm";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@helix.local";
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
  const name = "System Administrator";

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    console.log(`Seed admin already exists: ${email}`);
    await pool.end();
    return;
  }

  const passwordHash = await hashPassword(password);
  await db.insert(users).values({
    email,
    name,
    passwordHash,
    role: "SUPER_ADMIN",
    isActive: true,
  });

  console.log("Seed admin created:");
  console.log(`  email:    ${email}`);
  console.log(`  password: ${password}`);
  console.log("  IMPORTANT: change this password after first login.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
