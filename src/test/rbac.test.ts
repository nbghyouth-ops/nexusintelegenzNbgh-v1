import { describe, it, expect } from "vitest";
import { hasPermission, isAdmin } from "@/lib/auth/rbac";

describe("hasPermission", () => {
  it("allows SUPER_ADMIN full access to user management", () => {
    expect(hasPermission("SUPER_ADMIN", "users.manage")).toBe(true);
  });

  it("denies plain USER access to user management", () => {
    expect(hasPermission("USER", "users.manage")).toBe(false);
  });

  it("allows OPERATOR to create tracking sessions but not delete cases", () => {
    expect(hasPermission("OPERATOR", "tracking.create")).toBe(true);
    expect(hasPermission("OPERATOR", "cases.delete")).toBe(false);
  });

  it("allows every role to read their own cases", () => {
    expect(hasPermission("USER", "cases.read")).toBe(true);
  });
});

describe("isAdmin", () => {
  it("treats only SUPER_ADMIN and ADMIN as admin roles", () => {
    expect(isAdmin("SUPER_ADMIN")).toBe(true);
    expect(isAdmin("ADMIN")).toBe(true);
    expect(isAdmin("OPERATOR")).toBe(false);
    expect(isAdmin("USER")).toBe(false);
  });
});
