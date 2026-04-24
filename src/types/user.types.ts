import type { Person } from "./person.types";

/* Roles disponibles en el sistema */
export type Role = "ADMIN" | "RECEPCIONISTA" | "ENTRENADOR";

/* Planes de suscripción */
export type SubscriptionPlan = "BASIC" | "PREMIUM";

/* Estado de suscripción */
export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "PENDING" | "CANCELLED";

/* Tipo que representa un usuario del sistema */
export interface User extends Person {
  id: number;

  username: string;
  password: string;

  firstName: string;
  lastName: string;

  documentNumber: string;
  phone?: string;
  email?: string;
  address?: string;

  role: Role;

  createdAt: Date;
}

/* Usuario autenticado (incluye datos del tenant) */
export interface AuthUser {
  username: string;
  role: Role;
  tenantId?: string;
  plan?: SubscriptionPlan;
  subscriptionStatus?: SubscriptionStatus;
}
