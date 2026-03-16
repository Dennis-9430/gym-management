import type { ClientForm } from "../types/client.types";

const STORAGE_KEY = "gym-management.clients";

type StoredClient = Omit<
  ClientForm,
  "createdAt" | "memberShipStartDate" | "memberShipEndDate"
> & {
  createdAt?: string | null;
  memberShipStartDate: string | Date;
  memberShipEndDate: string | Date;
};

const seedClients: StoredClient[] = [
  {
    id: 1,
    documentType: "CEDULA",
    documentNumber: "0102030405",
    firstName: "Dennis Fabricio",
    lastName: "Pinzon Ajila",
    phone: "0994566938",
    email: "dennis@gmail.com",
    address: "Barrio la Y",
    emergencyContact: "Emilia Ajila",
    emergencyPhone: "0986367026",
    notes: "No tiene nada enconcreto",
    createdAt: new Date("2026-02-15").toISOString(),
    memberShip: "Mensual",
    memberShipStartDate: new Date("2026-02-08").toISOString(),
    memberShipEndDate: new Date("2026-03-08").toISOString(),
    memberShipStatus: "ACTIVE",
    fingerPrint: true,
  },
  {
    id: 2,
    documentType: "CEDULA",
    documentNumber: "0958745632",
    firstName: "Carlos",
    lastName: "Mendoza",
    phone: "0994565438",
    email: "dcarloss@gmail.com",
    address: "Barrio la Y",
    emergencyContact: "Emilia Ajila",
    emergencyPhone: "0986367026",
    notes: "No tiene nada enconcreto",
    createdAt: new Date("2026-02-20").toISOString(),
    memberShip: "Quincenal",
    memberShipStartDate: new Date("2026-02-05").toISOString(),
    memberShipEndDate: new Date("2026-02-20").toISOString(),
    memberShipStatus: "EXPIRED",
    fingerPrint: false,
  },
  {
    id: 3,
    documentType: "CEDULA",
    documentNumber: "0912345678",
    firstName: "Maria",
    lastName: "Lopez",
    phone: "0981122334",
    email: "mlopez@gmail.com",
    address: "Av. Central",
    emergencyContact: "Luis Lopez",
    emergencyPhone: "0998877665",
    notes: "Preferencia en horarios de tarde",
    createdAt: new Date("2026-03-08").toISOString(),
    memberShip: "Mensual",
    memberShipStartDate: new Date("2026-03-08").toISOString(),
    memberShipEndDate: new Date("2026-04-08").toISOString(),
    memberShipStatus: "ACTIVE",
    fingerPrint: true,
  },
  {
    id: 4,
    documentType: "CEDULA",
    documentNumber: "0923456789",
    firstName: "Jorge",
    lastName: "Reyes",
    phone: "0984455667",
    email: "jreyes@gmail.com",
    address: "Cdla. El Sol",
    emergencyContact: "Ana Reyes",
    emergencyPhone: "0997766554",
    notes: "Dolor de espalda",
    createdAt: new Date("2026-03-09").toISOString(),
    memberShip: "Mensual",
    memberShipStartDate: new Date("2026-03-09").toISOString(),
    memberShipEndDate: new Date("2026-04-09").toISOString(),
    memberShipStatus: "ACTIVE",
    fingerPrint: true,
  },
  {
    id: 5,
    documentType: "CEDULA",
    documentNumber: "0934567890",
    firstName: "Luisa",
    lastName: "Mora",
    phone: "0983344556",
    email: "lmora@gmail.com",
    address: "Barrio Norte",
    emergencyContact: "Juan Mora",
    emergencyPhone: "0996655443",
    notes: "Pendiente de suscripcion",
    createdAt: new Date("2026-03-11").toISOString(),
    memberShip: "Por registrar",
    memberShipStartDate: new Date("2026-03-11").toISOString(),
    memberShipEndDate: new Date("2026-03-11").toISOString(),
    memberShipStatus: "NONE",
    fingerPrint: false,
  },
  {
    id: 6,
    documentType: "CEDULA",
    documentNumber: "0945678901",
    firstName: "Kevin",
    lastName: "Ortega",
    phone: "0989988776",
    email: "korte@gmail.com",
    address: "Sector Sur",
    emergencyContact: "Paola Ortega",
    emergencyPhone: "0995544332",
    notes: "Pendiente de suscripcion",
    createdAt: new Date("2026-03-12").toISOString(),
    memberShip: "Por registrar",
    memberShipStartDate: new Date("2026-03-12").toISOString(),
    memberShipEndDate: new Date("2026-03-12").toISOString(),
    memberShipStatus: "NONE",
    fingerPrint: false,
  },
  {
    id: 7,
    documentType: "CEDULA",
    documentNumber: "0956789012",
    firstName: "Paula",
    lastName: "Sanchez",
    phone: "0976655443",
    email: "psanchez@gmail.com",
    address: "Los Jardines",
    emergencyContact: "Pedro Sanchez",
    emergencyPhone: "0965544332",
    notes: "Membresia vencida",
    createdAt: new Date("2026-03-05").toISOString(),
    memberShip: "Mensual",
    memberShipStartDate: new Date("2026-02-01").toISOString(),
    memberShipEndDate: new Date("2026-03-01").toISOString(),
    memberShipStatus: "EXPIRED",
    fingerPrint: false,
  },
  {
    id: 8,
    documentType: "CEDULA",
    documentNumber: "0967890123",
    firstName: "Andres",
    lastName: "Castro",
    phone: "0961122334",
    email: "acastro@gmail.com",
    address: "Ciudadela Vista",
    emergencyContact: "Elena Castro",
    emergencyPhone: "0954433221",
    notes: "Membresia vencida",
    createdAt: new Date("2026-03-02").toISOString(),
    memberShip: "Quincenal",
    memberShipStartDate: new Date("2026-02-10").toISOString(),
    memberShipEndDate: new Date("2026-02-25").toISOString(),
    memberShipStatus: "EXPIRED",
    fingerPrint: false,
  },
];

const toDate = (value: string | Date | undefined | null) => {
  if (!value) {
    return new Date();
  }
  return value instanceof Date ? value : new Date(value);
};

const normalizeClient = (client: StoredClient): ClientForm => ({
  ...client,
  createdAt: client.createdAt ? new Date(client.createdAt) : undefined,
  memberShipStartDate: toDate(client.memberShipStartDate),
  memberShipEndDate: toDate(client.memberShipEndDate),
});

const loadClients = (): ClientForm[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedClients));
    return seedClients.map(normalizeClient);
  }

  try {
    const parsed = JSON.parse(raw) as StoredClient[];
    if (!Array.isArray(parsed)) {
      return seedClients.map(normalizeClient);
    }
    return parsed.map(normalizeClient);
  } catch {
    return seedClients.map(normalizeClient);
  }
};

const saveClients = (clients: ClientForm[]) => {
  const payload: StoredClient[] = clients.map((client) => ({
    ...client,
    createdAt: client.createdAt ? client.createdAt.toISOString() : null,
    memberShipStartDate: client.memberShipStartDate?.toISOString(),
    memberShipEndDate: client.memberShipEndDate?.toISOString(),
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

const normalizeDocument = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();

export const getClients = (): ClientForm[] => {
  return loadClients().sort((a, b) => a.id - b.id);
};

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

export const createClient = (input: ClientForm): ClientForm => {
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
