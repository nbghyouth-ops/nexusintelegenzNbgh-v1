export type Role = "SUPER_ADMIN" | "ADMIN" | "OPERATOR" | "USER";

export const PERMISSIONS = {
  "cases.read": ["SUPER_ADMIN", "ADMIN", "OPERATOR", "USER"],
  "cases.create": ["SUPER_ADMIN", "ADMIN", "OPERATOR"],
  "cases.update": ["SUPER_ADMIN", "ADMIN", "OPERATOR"],
  "cases.delete": ["SUPER_ADMIN", "ADMIN"],

  "tracking.read": ["SUPER_ADMIN", "ADMIN", "OPERATOR", "USER"],
  "tracking.create": ["SUPER_ADMIN", "ADMIN", "OPERATOR"],
  "tracking.revoke": ["SUPER_ADMIN", "ADMIN", "OPERATOR"],

  "locations.read": ["SUPER_ADMIN", "ADMIN", "OPERATOR", "USER"],
  "locations.delete": ["SUPER_ADMIN", "ADMIN"],

  "photos.read": ["SUPER_ADMIN", "ADMIN", "OPERATOR", "USER"],
  "photos.create": ["SUPER_ADMIN", "ADMIN", "OPERATOR", "USER"],
  "photos.delete": ["SUPER_ADMIN", "ADMIN"],

  "camera.read": ["SUPER_ADMIN", "ADMIN", "OPERATOR", "USER"],
  "camera.create": ["SUPER_ADMIN", "ADMIN", "OPERATOR"],

  "analytics.read": ["SUPER_ADMIN", "ADMIN", "OPERATOR"],

  "users.read": ["SUPER_ADMIN", "ADMIN"],
  "users.manage": ["SUPER_ADMIN"],

  "settings.read": ["SUPER_ADMIN", "ADMIN"],
  "settings.manage": ["SUPER_ADMIN"],

  "audit.read": ["SUPER_ADMIN", "ADMIN"],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: Role, permission: Permission): boolean {
  const allowed = PERMISSIONS[permission] as readonly Role[];
  return allowed.includes(role);
}

export function isAdmin(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}
