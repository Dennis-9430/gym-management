/* Servicio para gestionar clientes */
// Direccion del archivo: src/services/clients.service.ts
// Relacionado con: useListClientsHook.ts, ListClients.tsx, backend/app/routers/clients.py

import type { ClientForm } from "../types/client.types";

// Configuración de API - usa variable de entorno o fallback
const getApiBaseUrl = () => import.meta.env.VITE_API_URL || "http://localhost:8000";

// Constantes de configuracion
// Relacionado con: backend/app/routers/clients.py
const API_BASE = `${getApiBaseUrl()}/api/clients`;
const STORAGE_KEY = "gym-management.clients";

// Obtiene clientes desde MongoDB
// Relacionado con: backend/app/routers/clients.py (list_clients)
export const getClientsFromAPI = async (): Promise<ClientForm[]> => {
  try {
    const response = await fetch(`${API_BASE}?active_only=false`);
    if (!response.ok) {
      throw new Error("Error al obtener clientes");
    }
    const data = await response.json();
    return data.clients || [];
  } catch (error) {
    console.error("Error cargando clientes desde API:", error);
    throw error;
  }
};

// Obtiene clientes (intenta API, fallback localStorage)
// Relacionado con: useListClientsHook.ts
export const getClients = async (): Promise<ClientForm[]> => {
  try {
    return await getClientsFromAPI();
  } catch {
    return loadClients().sort(sortByStatus);
  }
};

// Funciones locales (fallback)

/**
 * Busca cliente por numero de documento
 * @param documentNumber - Numero de documento a buscar
 * @returns Cliente o null
 */
export const findClientByDocument = (documentNumber: string): ClientForm | null => {
  const normalized = normalizeDocument(documentNumber);
  if (!normalized) {
    return null;
  }
  return (
    loadClients().find(
      (client) => normalizeDocument(client.documentNumber) === normalized,
    ) ?? null
  );
};

/* Obtiene cliente por ID */
export const getClientById = async (id: number): Promise<ClientForm | null> => {
  try {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) {
      throw new Error("Cliente no encontrado");
    }
    return await response.json();
  } catch {
    const clients = loadClients();
    return clients.find((c) => c.id === id) ?? null;
  }
};

/* Crea cliente */
export const createClientAPI = async (
  client: Omit<ClientForm, "id" | "createdAt">
): Promise<ClientForm | null> => {
  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(client),
    });
    if (!response.ok) {
      throw new Error("Error al crear cliente");
    }
    return await response.json();
  } catch (error) {
    console.error("Error creando cliente:", error);
    return null;
  }
};

/* Actualiza cliente */
export const updateClientAPI = async (
  id: number,
  client: Partial<ClientForm>
): Promise<ClientForm | null> => {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(client),
    });
    if (!response.ok) {
      throw new Error("Error al actualizar cliente");
    }
    return await response.json();
  } catch (error) {
    console.error("Error actualizando cliente:", error);
    return null;
  }
};

/* Elimina cliente */
export const deleteClientAPI = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Error eliminando cliente:", error);
    return false;
  }
};

/* Tipo que representa un cliente almacenado */
type StoredClient = Omit<
  ClientForm,
  "createdAt" | "memberShipStartDate" | "memberShipEndDate"
> & {
  createdAt?: string | null;
  memberShipStartDate: string | Date;
  memberShipEndDate: string | Date;
};

/* Consumir final -保留 para referencia */
export const seedClients: StoredClient[] = [
  {
    id: 999,
    documentType: "CEDULA",
    documentNumber: "99999999",
    firstName: "Consumidor",
    lastName: "Final",
    phone: "",
    email: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    notes: "Consumidor final - sin factura",
    createdAt: new Date().toISOString(),
    memberShip: "Por registrar",
    memberShipStartDate: new Date().toISOString(),
    memberShipEndDate: new Date().toISOString(),
    memberShipStatus: "NONE",
    fingerPrint: false,
  },
  {
    id: 1,
    documentType: "CEDULA",
    documentNumber: "0102030405",
    firstName: "Ana",
    lastName: "Garcia",
    phone: "0991112233",
    email: "agarcia@gmail.com",
    address: "Barrio Centro",
    emergencyContact: "Luis Garcia",
    emergencyPhone: "0982223344",
    notes: "Nuevo cliente",
    createdAt: new Date("2026-03-15").toISOString(),
    memberShip: "Por registrar",
    memberShipStartDate: new Date("2026-03-15").toISOString(),
    memberShipEndDate: new Date("2026-03-15").toISOString(),
    memberShipStatus: "NONE",
    fingerPrint: false,
  },
  {
    id: 2,
    documentType: "CEDULA",
    documentNumber: "0102030406",
    firstName: "Roberto",
    lastName: "Mejia",
    phone: "0993334455",
    email: "rmejia@gmail.com",
    address: "Barrio Norte",
    emergencyContact: "Maria Mejia",
    emergencyPhone: "0984445566",
    notes: "Nuevo cliente",
    createdAt: new Date("2026-03-16").toISOString(),
    memberShip: "Por registrar",
    memberShipStartDate: new Date("2026-03-16").toISOString(),
    memberShipEndDate: new Date("2026-03-16").toISOString(),
    memberShipStatus: "NONE",
    fingerPrint: false,
  },
  {
    id: 3,
    documentType: "CEDULA",
    documentNumber: "0912345678",
    firstName: "Carlos",
    lastName: "Rodriguez",
    phone: "0985566778",
    email: "crodriguez@gmail.com",
    address: "Av. Principal",
    emergencyContact: "Sofia Rodriguez",
    emergencyPhone: "0996677889",
    notes: "Membresia vencida",
    createdAt: new Date("2026-01-10").toISOString(),
    memberShip: "Mensual",
    memberShipStartDate: new Date("2026-01-15").toISOString(),
    memberShipEndDate: new Date("2026-02-15").toISOString(),
    memberShipStatus: "EXPIRED",
    fingerPrint: false,
  },
  {
    id: 4,
    documentType: "CEDULA",
    documentNumber: "0923456789",
    firstName: "Laura",
    lastName: "Fernandez",
    phone: "0976677889",
    email: "lfernandez@gmail.com",
    address: "Cdla. Verde",
    emergencyContact: "Pedro Fernandez",
    emergencyPhone: "0967788990",
    notes: "Membresia vencida",
    createdAt: new Date("2026-01-20").toISOString(),
    memberShip: "Quincenal",
    memberShipStartDate: new Date("2026-02-01").toISOString(),
    memberShipEndDate: new Date("2026-02-16").toISOString(),
    memberShipStatus: "EXPIRED",
    fingerPrint: false,
  },
  {
    id: 5,
    documentType: "CEDULA",
    documentNumber: "0934567890",
    firstName: "Diego",
    lastName: "Alvarez",
    phone: "0967788990",
    email: "dalvarez@gmail.com",
    address: "Sector Este",
    emergencyContact: "Carmen Alvarez",
    emergencyPhone: "0958899001",
    notes: "Membresia vencida",
    createdAt: new Date("2026-02-05").toISOString(),
    memberShip: "Mensual",
    memberShipStartDate: new Date("2026-02-10").toISOString(),
    memberShipEndDate: new Date("2026-03-10").toISOString(),
    memberShipStatus: "EXPIRED",
    fingerPrint: false,
  },
  {
    id: 6,
    documentType: "CEDULA",
    documentNumber: "0945678901",
    firstName: "Sofia",
    lastName: "Cruz",
    phone: "0958899001",
    email: "scruz@gmail.com",
    address: "Barrio Sur",
    emergencyContact: "Jorge Cruz",
    emergencyPhone: "0949900112",
    notes: "Membresia vencida",
    createdAt: new Date("2026-02-15").toISOString(),
    memberShip: "Mensual",
    memberShipStartDate: new Date("2026-02-20").toISOString(),
    memberShipEndDate: new Date("2026-03-20").toISOString(),
    memberShipStatus: "EXPIRED",
    fingerPrint: false,
  },
  {
    id: 7,
    documentType: "CEDULA",
    documentNumber: "0956789012",
    firstName: "Miguel",
    lastName: "Torres",
    phone: "0949900112",
    email: "mtorres@gmail.com",
    address: "Los Rosales",
    emergencyContact: "Lucia Torres",
    emergencyPhone: "0930011223",
    notes: "Membresia vencida",
    createdAt: new Date("2026-02-20").toISOString(),
    memberShip: "Quincenal",
    memberShipStartDate: new Date("2026-02-25").toISOString(),
    memberShipEndDate: new Date("2026-03-11").toISOString(),
    memberShipStatus: "EXPIRED",
    fingerPrint: false,
  },
  {
    id: 8,
    documentType: "CEDULA",
    documentNumber: "0912345670",
    firstName: "Maria",
    lastName: "Lopez",
    phone: "0981122334",
    email: "mlopez@gmail.com",
    address: "Av. Central",
    emergencyContact: "Luis Lopez",
    emergencyPhone: "0998877665",
    notes: "Cliente activo",
    createdAt: new Date("2026-03-01").toISOString(),
    memberShip: "Mensual",
    memberShipStartDate: new Date("2026-03-08").toISOString(),
    memberShipEndDate: new Date("2026-04-08").toISOString(),
    memberShipStatus: "ACTIVE",
    fingerPrint: true,
  },
  {
    id: 9,
    documentType: "CEDULA",
    documentNumber: "0923456780",
    firstName: "Jorge",
    lastName: "Reyes",
    phone: "0984455667",
    email: "jreyes@gmail.com",
    address: "Cdla. El Sol",
    emergencyContact: "Ana Reyes",
    emergencyPhone: "0997766554",
    notes: "Cliente activo",
    createdAt: new Date("2026-03-05").toISOString(),
    memberShip: "Mensual",
    memberShipStartDate: new Date("2026-03-09").toISOString(),
    memberShipEndDate: new Date("2026-04-09").toISOString(),
    memberShipStatus: "ACTIVE",
    fingerPrint: true,
  },
  {
    id: 10,
    documentType: "CEDULA",
    documentNumber: "0934567891",
    firstName: "Elena",
    lastName: "Vargas",
    phone: "0975566778",
    email: "evargas@gmail.com",
    address: "Barrio Alto",
    emergencyContact: "Carlos Vargas",
    emergencyPhone: "0966677889",
    notes: "Cliente activo",
    createdAt: new Date("2026-03-10").toISOString(),
    memberShip: "Mensual",
    memberShipStartDate: new Date("2026-03-12").toISOString(),
    memberShipEndDate: new Date("2026-04-12").toISOString(),
    memberShipStatus: "ACTIVE",
    fingerPrint: true,
  },
];

// Funciones helper

/**
 * Convierte valor a Date
 * @param value - Valor a convertir
 * @returns Date
 */
const toDate = (value: string | Date | undefined | null) => {
  if (!value) {
    return new Date();
  }
  return value instanceof Date ? value : new Date(value);
};

/**
 * Normaliza cliente de almacenamiento a formato de formulario
 * @param client - Cliente almacenado
 * @returns Cliente en formato de formulario
 */
const normalizeClient = (client: StoredClient): ClientForm => ({
  ...client,
  createdAt: client.createdAt ? new Date(client.createdAt) : undefined,
  memberShipStartDate: toDate(client.memberShipStartDate),
  memberShipEndDate: toDate(client.memberShipEndDate),
});

// Funciones de manejo de datos locales (Fallback)

/**
 * Carga clientes desde localStorage
 * @returns Array de clientes (solo datos locales, no crea seed)
 */
const loadClients = (): ClientForm[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];  // No usar datos seed - usar solo DB
  }

  try {
    const parsed = JSON.parse(raw) as StoredClient[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map(normalizeClient);
  } catch {
    return [];
  }
};

const saveClients = (clients: ClientForm[]) => {
  // Convierte fechas a strings para localStorage
  const payload: StoredClient[] = clients.map((client) => ({
    ...client,
    createdAt: client.createdAt ? client.createdAt.toISOString() : null,
    memberShipStartDate: client.memberShipStartDate?.toISOString(),
    memberShipEndDate: client.memberShipEndDate?.toISOString(),
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

/**
 * Normaliza numero de documento (移除 caracteres especiales)
 * @param value - Numero de documento
 * @returns Documento normalizado
 */
const normalizeDocument = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();

/**
 * Ordena clientes por estado de membresia
 * @param a - Cliente A
 * @param b - Cliente B
 * @returns Valor de ordenamiento
 */
const sortByStatus = (a: ClientForm, b: ClientForm): number => {
  const order: Record<string, number> = { NONE: 0, EXPIRED: 1, ACTIVE: 2 };
  return order[a.memberShipStatus] - order[b.memberShipStatus];
};

// Funciones locales (Fallback)

/**
 * Crea cliente en localStorage (fallback)
 * @param input - Datos del cliente
 * @returns Cliente creado
 */
export const createClient = (input: Omit<ClientForm, "id" | "createdAt">): ClientForm => {
  const clients = loadClients();
  const nextId = clients.length
    ? Math.max(...clients.map((client) => client.id)) + 1
    : 1;

  const now = new Date();
  const newClient: ClientForm = {
    ...input,
    id: nextId,
    createdAt: now,
    memberShipStatus: input.memberShipStatus ?? "NONE",
    memberShip: input.memberShip || "Por registrar",
    memberShipStartDate: input.memberShipStartDate ?? now,
    memberShipEndDate: input.memberShipEndDate ?? now,
  };

  const updated = [...clients, newClient];
  saveClients(updated);
  return newClient;
};

export const updateClient = (id: number, update: ClientForm): ClientForm => {
  const clients = loadClients();
  const index = clients.findIndex((client) => client.id === id);
  if (index === -1) {
    throw new Error("Cliente no encontrado");
  }

  const updatedClient: ClientForm = {
    ...clients[index],
    ...update,
    id,
  };

  const updatedClients = [...clients];
  updatedClients[index] = updatedClient;
  saveClients(updatedClients);
  return updatedClient;
};
