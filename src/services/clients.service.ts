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
    createdAt: new Date().toISOString(),
    memberShip: "Mensual",
    memberShipStartDate: new Date("2026-02-08").toISOString(),
    memberShipEndDate: new Date("2026-03-08").toISOString(),
    memberShipStatus: "ACTIVE",
    fingerPrint: false,
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
    createdAt: new Date().toISOString(),
    memberShip: "Quincenal",
    memberShipStartDate: new Date("2026-03-05").toISOString(),
    memberShipEndDate: new Date("2026-05-17").toISOString(),
    memberShipStatus: "EXPIRED",
    fingerPrint: true,
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

  const newClient: ClientForm = {
    ...input,
    id: nextId,
    createdAt: new Date(),
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
