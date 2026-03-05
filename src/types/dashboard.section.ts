import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Users,
  DollarSign,
  Package,
  ShoppingCart,
  UserCog,
  UserPlus,
} from "lucide-react";

export type Role = "ADMIN" | "EMPLOYEE";
export type SectionAction = "NAVIGATE" | "MODAL";
export interface DashboardSection {
  title: string;
  path: string;
  action: SectionAction;
  icon: LucideIcon;
  roles: Role[];
}
export const sections: DashboardSection[] = [
  {
    title: "Registro de Pago",
    path: "/payments",
    icon: DollarSign,
    action: "MODAL",
    roles: ["ADMIN", "EMPLOYEE"],
  },

  {
    title: "Registrar Cliente",
    path: "/clients",
    icon: UserPlus,
    action: "NAVIGATE",
    roles: ["ADMIN", "EMPLOYEE"],
  },
  {
    title: "Lista de Clientes",
    path: "/clients",
    icon: Users,
    action: "NAVIGATE",
    roles: ["ADMIN", "EMPLOYEE"],
  },
  {
    title: "Productos",
    path: "/products",
    icon: Package,
    action: "NAVIGATE",
    roles: ["ADMIN", "EMPLOYEE"],
  },
  {
    title: "Punto de Venta",
    path: "/sales",
    icon: ShoppingCart,
    action: "NAVIGATE",
    roles: ["ADMIN", "EMPLOYEE"],
  },

  {
    title: "Registrar Personal",
    path: "/employees",
    icon: UserCog,
    action: "NAVIGATE",
    roles: ["ADMIN"],
  },
  {
    title: "Reporte Financiero",
    path: "/financial",
    icon: BarChart3,
    action: "NAVIGATE",
    roles: ["ADMIN"],
  },
];
