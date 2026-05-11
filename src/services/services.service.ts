/* Servicio para gestionar servicios/membresías desde MongoDB */
import type { Service } from "../types/payment.types";
import { apiGet, apiPost, apiPut, apiDelete } from "./api";

interface ServiceResponse {
  services: Service[];
  total: number;
}

/* Obtiene TODOS los servicios desde MongoDB */
export const getServices = async (): Promise<Service[]> => {
  const data: ServiceResponse = await apiGet("/api/services?active_only=false");
  return data.services;
};

/* Obtiene servicios para pago diario (precio <= $7) */
export const getDailyServices = async (): Promise<Service[]> => {
  const data: ServiceResponse = await apiGet("/api/services?max_price=7&active_only=true");
  return data.services;
};

/* Obtiene membresías (precio > $5) */
export const getMembershipServices = async (): Promise<Service[]> => {
  const data: ServiceResponse = await apiGet("/api/services?min_price=5.01&active_only=true");
  return data.services;
};

/* Crea un nuevo servicio */
export const createService = async (
  service: Omit<Service, "id" | "createdAt" | "updatedAt">
): Promise<Service | null> => {
  const created: Service = await apiPost("/api/services", service);
  return created;
};

/* Actualiza un servicio existente */
export const updateService = async (
  id: string,
  service: Partial<Service>
): Promise<Service | null> => {
  const updated: Service = await apiPut(`/api/services/${id}`, service);
  return updated;
};

/* Elimina un servicio (soft delete) */
export const deleteService = async (id: string): Promise<boolean> => {
  try {
    await apiDelete(`/api/services/${id}`);
    return true;
  } catch {
    return false;
  }
};

/* Asigna membresía a un cliente */
export const assignMembership = async (
  clientId: number | string,
  serviceId: string,
  startDate?: string
): Promise<any> => {
  const result = await apiPost(`/api/clients/${clientId}/assign-membership`, { serviceId, startDate });
  return result;
};