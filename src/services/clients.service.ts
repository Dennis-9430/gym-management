/* Servicio para gestionar clientes */
// Direccion del archivo: src/services/clients.service.ts
// Relacionado con: useListClientsHook.ts, ListClients.tsx, backend/app/routers/clients.py

import type { ClientForm } from "../types/client.types";
import { apiDelete, apiGet, apiPost, apiPut } from "./api";

// Función helper para mapear respuesta de API a ClientForm
const mapClientResponse = (client: any): ClientForm => ({
  id: client.id || client._id || "",
  documentType: client.documentType || "CEDULA",
  documentNumber: client.documentNumber || "",
  firstName: client.firstName || "",
  lastName: client.lastName || "",
  email: client.email || "",
  phone: client.phone || "",
  address: client.address || "",
  emergencyContact: client.emergencyContact || "",
  emergencyPhone: client.emergencyPhone || "",
  notes: client.notes || "",
  createdAt: client.createdAt ? new Date(client.createdAt) : undefined,
  memberShip: client.membership || "Por registrar",
  memberShipStartDate: client.membershipStartDate ? new Date(client.membershipStartDate) : new Date(),
  memberShipEndDate: client.membershipEndDate ? new Date(client.membershipEndDate) : new Date(),
  memberShipStatus: client.membershipStatus || "NONE",
  fingerPrint: client.fingerPrint || false,
});

// Obtiene clientes desde MongoDB
// Relacionado con: backend/app/routers/clients.py (list_clients), useListClientsHook.ts
export const getClients = async (): Promise<ClientForm[]> => {
  const data: any = await apiGet("/api/clients");
  return (data.clients || []).map(mapClientResponse);
};

/* Obtiene cliente por ID */
export const getClientById = async (id: number | string): Promise<ClientForm | null> => {
  const client: any = await apiGet(`/api/clients/${id}`);
  return mapClientResponse(client);
};

/* Crea cliente */
export const createClientAPI = async (
  client: Omit<ClientForm, "id" | "createdAt">
): Promise<ClientForm | null> => {
  const created = await apiPost("/api/clients", client) as Record<string, any>;
  return getClientById(created.id || created._id || "");
};

/* Actualiza cliente */
export const updateClientAPI = async (
  id: number | string,
  client: Partial<ClientForm>
): Promise<ClientForm | null> => {
  const updated = await apiPut("/api/clients/update", { ...client, client_id: id }) as Record<string, any>;
  return getClientById(updated.id || updated._id || id);
};

/* Elimina cliente */
export const deleteClientAPI = async (id: number | string): Promise<boolean> => {
  try {
    await apiDelete(`/api/clients/${id}`);
    return true;
  } catch (error) {
    return false;
  }
};

/* Alias para migrar pantallas viejas al backend sin duplicar contratos. */
export const createClientRemote = createClientAPI;

/* Alias para migrar pantallas viejas al backend sin tocar el resto del flujo. */
export const updateClientRemote = updateClientAPI;
