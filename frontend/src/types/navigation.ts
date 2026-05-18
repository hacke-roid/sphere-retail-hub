import type { LucideIcon } from "lucide-react";
import type { UserRole } from "./auth";

export type AppView =
  // | "dashboard"
  | "tenants"
  | "users"
  | "products"
  // | "categories"
  // | "configuration"
  | "analytics"
  | "settings";
// | "profile";

export type NavItem = {
  id: AppView;
  label: string;
  icon: LucideIcon;
  path: string;
  roles: UserRole[];
};
