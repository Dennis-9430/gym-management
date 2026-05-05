/* Servicio para gestionar servicios/membresías desde MongoDB */
import type { Service } from "../types/payment.types";
import { getAuthHeaders, getApiBaseUrl } from "./api";

const API_BASE = `${getApiBaseUrl()}/api/services`;

interface ServiceResponse {
  services: Service[];
  total: number;
}

/* Obtiene TODOS los servicios desde MongoDB */
export const getServices = async (): Promise<Service[]> => {
  try {
    const response = await fetch(`${API_BASE}?active_only=false`, { headers: getAuthHeaders() });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }
    const data: ServiceResponse = await response.json();
    return data.services;
  } catch (error: any) {
    console.error("Error getServices:", error);
    throw error;
  }
};

/* Obtiene servicios para pago diario (precio <= $7) */
export const getDailyServices = async (): Promise<Service[]> => {
  try {
    const response = await fetch(`${API_BASE}?max_price=7&active_only=true`, { headers: getAuthHeaders() });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }
    const data: ServiceResponse = await response.json();
    return data.services;
  } catch (error: any) {
    console.error("Error getDailyServices:", error);
    throw error;
  }
};

/* Obtiene membresías (precio > $5) */
export const getMembershipServices = async (): Promise<Service[]> => {
  try {
    const response = await fetch(`${API_BASE}?min_price=5.01&active_only=true`, { headers: getAuthHeaders() });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }
    const data: ServiceResponse = await response.json();
    return data.services;
  } catch (error: any) {
    console.error("Error getMembershipServices:", error);
    throw error;
  }
};

/* Crea un nuevo servicio */
export const createService = async (
  service: Omit<Service, "id" | "createdAt" | "updatedAt">
): Promise<Service | null> => {
  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(service),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

/* Actualiza un servicio existente */
export const updateService = async (
  id: string,
  service: Partial<Service>
): Promise<Service | null> => {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(service),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

/* Elimina un servicio (soft delete) */
export const deleteService = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }
    return response.ok;
  } catch (error) {
    return false;
  }
};

/* Asigna membresía a un cliente */
export const assignMembership = async (
  clientId: number,
  serviceId: string,
  startDate?: string
): Promise<any> => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/clients/${clientId}/assign-membership`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ serviceId, startDate }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};