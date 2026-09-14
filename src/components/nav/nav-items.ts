export type NavItem = {
  href: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
};

export const PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "◆" },
  { href: "/tracking", label: "Tracking", icon: "◎" },
  { href: "/locations", label: "Locations", icon: "◈" },
  { href: "/photos", label: "Photos", icon: "▣" },
  { href: "/events", label: "Email / Events", icon: "✉" },
  { href: "/phone", label: "Phone Intel", icon: "☎" },
  { href: "/camera", label: "Camera Verification", icon: "◉" },
  { href: "/cases", label: "Cases / Records", icon: "▤" },
  { href: "/analytics", label: "Analytics", icon: "▲" },
  { href: "/notifications", label: "Notifications", icon: "●" },
  { href: "/users", label: "Users", icon: "◫" },
  { href: "/settings", label: "Settings", icon: "⚙" },
  { href: "/audit", label: "Audit Logs", icon: "▦" },
];

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin/health", label: "System Health", icon: "♥", adminOnly: true },
  { href: "/admin/providers", label: "Provider Status", icon: "⛁", adminOnly: true },
  { href: "/admin/roles", label: "Role Management", icon: "♛", adminOnly: true },
  { href: "/admin/settings", label: "Advanced Settings", icon: "✦", adminOnly: true },
];

export const MOBILE_NAV: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: "◆" },
  { href: "/tracking", label: "Tracking", icon: "◎" },
  { href: "/locations", label: "Map", icon: "◈" },
  { href: "/cases", label: "Cases", icon: "▤" },
  { href: "/more", label: "More", icon: "☰" },
];
