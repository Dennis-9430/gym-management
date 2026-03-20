import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Users,
  DollarSign,
  Package,
  ShoppingCart,
  UserCog,
  ClipboardCheck,
} from "lucide-react";

export type Role = "ADMIN" | "RECEPCIONISTA" | "ENTRENADOR";
export type SectionAction = "NAVIGATE" | "MODAL";
export interface DashboardSection {
  title: string;
  path: string;
  action: SectionAction;
  icon: LucideIcon;
  roles: Role[];
  buttonLabel?: string;
  description?: string;
}
export const sections: DashboardSection[] = [
  {
    title: "Registro de Pago Diario",
    path: "/payments",
    icon: DollarSign,
    action: "MODAL",
    roles: ["ADMIN", "RECEPCIONISTA"],
    buttonLabel: "Registrar",
    description: "Registra pagos de membresías",
  },

  {
    title: "Usuarios",
    path: "/clients/list",
    icon: Users,
    action: "NAVIGATE",
    roles: ["ADMIN", "RECEPCIONISTA", "ENTRENADOR"],
    buttonLabel: "Ver lista",
    description: "Gestiona clientes del gimnasio",
  },
  {
    title: "Productos",
    path: "/products",
    icon: Package,
    action: "NAVIGATE",
    roles: ["ADMIN", "RECEPCIONISTA"],
    buttonLabel: "Ver productos",
    description: "Administra inventario",
  },
  {
    title: "Ventas",
    path: "/sales",
    icon: ShoppingCart,
    action: "NAVIGATE",
    roles: ["ADMIN", "RECEPCIONISTA"],
    buttonLabel: "Ir a ventas",
    description: "Registro de ventas y suscripciones",
  },
  {
    title: "Registrar Personal",
    path: "/employees",
    icon: UserCog,
    action: "NAVIGATE",
    roles: ["ADMIN"],
    buttonLabel: "Ver personal",
    description: "Gestiona empleados",
  },
  {
    title: "Reporte Financiero",
    path: "/financial",
    icon: BarChart3,
    action: "NAVIGATE",
    roles: ["ADMIN"],
    buttonLabel: "Ver reportes",
    description: "Análisis financiero del negocio",
  },
  {
    title: "Historial de Asistencia",
    path: "/attendance",
    icon: ClipboardCheck,
    action: "NAVIGATE",
    roles: ["ADMIN", "RECEPCIONISTA", "ENTRENADOR"],
    buttonLabel: "Ver asistencia",
    description: "Control de entrada y salida",
  },
];
