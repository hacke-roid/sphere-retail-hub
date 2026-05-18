import {
  BarChart3,
  Boxes,
  Building2,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  UserCircle,
  Users,
} from "lucide-react";
import type { NavItem } from "../types/navigation";

export const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    roles: ["super_admin", "admin", "member"],
  },
  {
    id: "tenants",
    label: "Tenants",
    icon: Building2,
    path: "/tenants",
    roles: ["super_admin"],
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
    path: "/users",
    roles: ["super_admin", "admin"],
  },
  {
    id: "products",
    label: "Products",
    icon: Package,
    path: "/products",
    roles: ["admin", "member"],
  },
  {
    id: "categories",
    label: "Categories",
    icon: Boxes,
    path: "/categories",
    roles: ["admin"],
  },
  {
    id: "configuration",
    label: "Configuration",
    icon: ShoppingBag,
    path: "/configuration",
    roles: ["admin"],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    path: "/analytics",
    roles: ["super_admin", "admin"],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    path: "/settings",
    roles: ["super_admin"],
  },
  {
    id: "profile",
    label: "Profile",
    icon: UserCircle,
    path: "/profile",
    roles: ["member"],
  },
];
