/* Servicio para gestionar servicios/membresías desde MongoDB */
import type { Service } from "../types/payment.types";
import { services as defaultServices } from "../types/payment.types";

const API_BASE = "/api/services";

interface ServiceResponse {
  services: Service[];
  total: number;
}

/* Obtiene servicios desde MongoDB */
export const getServices = async (): Promise<Service[]> => {
  try {
    const response = await fetch(`${API_BASE}?active_only=true`);
    if (!response.ok) {
      throw new Error("Error al obtener servicios");
    }
    const data: ServiceResponse = await response.json();
    return data.services;
  } catch (error) {
    console.error("Error cargando servicios:", error);
    return defaultServices;
  }
};

/* Crea un nuevo servicio */
export const createService = async (
  service: Omit<Service, "id">
): Promise<Service | null> => {
  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(service),
    });
    if (!response.ok) {
      throw new Error("Error al crear servicio");
    }
    return await response.json();
  } catch (error) {
    console.error("Error creando servicio:", error);
    return null;
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(service),
    });
    if (!response.ok) {
      throw new Error("Error al actualizar servicio");
    }
    return await response.json();
  } catch (error) {
    console.error("Error actualizando servicio:", error);
    return null;
  }
};

/* Elimina un servicio */
export const deleteService = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Error eliminando servicio:", error);
    return false;
  }
};

/* Obtiene servicios filtrados por precio (para registro diario) */
export const getDailyServices = async (): Promise<Service[]> => {
  const services = await getServices();
  return services.filter((s) => s.price <= 7);
};