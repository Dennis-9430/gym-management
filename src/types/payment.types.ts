/* Tipos para servicios y pagos */

// Tipos de servicio
export type ServiceType = "daily" | "membership" | "special";

// Unidades de duración
export type DurationUnit = "days" | "weeks" | "months";

// Método de pago
export type PaymentMethod = "CASH" | "TRANSFER" | "MIXED";

// Servicio completo (viene del backend)
export interface Service {
  id: string;
  tenantId?: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  durationUnit: DurationUnit;
  type: ServiceType;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Servicio simple (para selectores, dropdowns)
export interface ServiceSimple {
  id: string;
  name: string;
  price: number;
  duration?: number;
  durationUnit?: DurationUnit;
  type?: ServiceType;
}

// Servicios default (fallback si falla API) - NO USAR, ahora el backend los crea
export const services: Service[] = [];
