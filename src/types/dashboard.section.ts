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

export type Role = "ADMIN" | "RECEPCIONISTA" | "ENTRENADOR";
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
    roles: ["ADMIN", "RECEPCIONISTA"],
  },

  {
    title: "Registrar Cliente",
    path: "/clients/register",
    icon: UserPlus,
    action: "NAVIGATE",
    roles: ["ADMIN", "RECEPCIONISTA"],
  },
  {
    title: "Lista de Clientes",
    path: "/clients/list",
    icon: Users,
    action: "NAVIGATE",
    roles: ["ADMIN", "RECEPCIONISTA", "ENTRENADOR"],
  },
  {
    title: "Productos",
    path: "/products",
    icon: Package,
    action: "NAVIGATE",
    roles: ["ADMIN", "RECEPCIONISTA"],
  },
  {
    title: "Punto de Venta",
    path: "/sales",
    icon: ShoppingCart,
    action: "NAVIGATE",
    roles: ["ADMIN", "RECEPCIONISTA"],
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
