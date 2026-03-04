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

export interface DashboardSection {
  title: string;
  path: string;
  icon: LucideIcon;
  roles: Role[];
}
export const sections: DashboardSection[] = [
  {
    title: "Registra Cliente",
    path: "/clients/registrer",
    icon: UserPlus,
    roles: ["ADMIN", "EMPLOYEE"],
  },
  {
    title: "Lista de Clientes",
    path: "/clients",
    icon: Users,
    roles: ["ADMIN", "EMPLOYEE"],
  },
  {
    title: "Productos",
    path: "/products",
    icon: Package,
    roles: ["ADMIN", "EMPLOYEE"],
  },
  {
    title: "Punto de Venta",
    path: "/sales",
    icon: ShoppingCart,
    roles: ["ADMIN", "EMPLOYEE"],
  },
  {
    title: "Registro de Pago",
    path: "/payments",
    icon: DollarSign,
    roles: ["ADMIN", "EMPLOYEE"],
  },
  {
    title: "Registrar Personal",
    path: "/employees",
    icon: UserCog,
    roles: ["ADMIN"],
  },
  {
    title: "Reporte Financiero",
    path: "/financial",
    icon: BarChart3,
    roles: ["ADMIN"],
  },
];
