import type { SaleInput, SaleRecord } from "../types/sales.types";

const STORAGE_KEY = "gym-management.sales";

const getDaysAgo = (days: number) => {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
};

const sampleSales: SaleRecord[] = [
  {
    id: 1,
    createdAt: getDaysAgo(0),
    items: [
      { key: "1", id: 1, name: "Membresía Mensual", description: "Acceso mensual", category: "servicio", stock: null, unitPrice: 30, unitDiscount: 0, quantity: 1, subtotal: 30, source: "MEMBERSHIP" },
      { key: "2", id: 2, name: "Agua", description: "Botella de agua", category: "bar", stock: 50, unitPrice: 1.5, unitDiscount: 0, quantity: 2, subtotal: 3, source: "PRODUCT" },
    ],
    totals: { subtotal: 33, taxableSubtotal: 33, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 33 },
    client: { documentNumber: "12345678", firstName: "Juan", lastName: "Pérez" },
    payment: { method: "CASH", cashAmount: 33, transferAmount: 0 },
    createdBy: "Recepcionista 1",
  },
  {
    id: 2,
    createdAt: getDaysAgo(0),
    items: [
      { key: "3", id: 3, name: "Membresía Quincenal", description: "Acceso quincenal", category: "servicio", stock: null, unitPrice: 18, unitDiscount: 0, quantity: 1, subtotal: 18, source: "MEMBERSHIP" },
    ],
    totals: { subtotal: 18, taxableSubtotal: 18, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 18 },
    client: { documentNumber: "87654321", firstName: "María", lastName: "García" },
    payment: { method: "TRANSFER", cashAmount: 0, transferAmount: 18 },
    voucherCode: "TRF-001",
    createdBy: "Recepcionista 1",
  },
  {
    id: 3,
    createdAt: getDaysAgo(0),
    items: [
      { key: "4", id: 4, name: "Bebida Energética", description: "Bebida energizante", category: "bar", stock: 30, unitPrice: 3, unitDiscount: 0, quantity: 3, subtotal: 9, source: "PRODUCT" },
      { key: "5", id: 5, name: "Snack", description: "Snack proteico", category: "bar", stock: 20, unitPrice: 2.5, unitDiscount: 0, quantity: 2, subtotal: 5, source: "PRODUCT" },
    ],
    totals: { subtotal: 14, taxableSubtotal: 14, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 14 },
    client: { documentNumber: "11223344", firstName: "Pedro", lastName: "López" },
    payment: { method: "MIXED", cashAmount: 7, transferAmount: 7 },
    voucherCode: "TRF-002",
    createdBy: "Recepcionista 2",
  },
  {
    id: 4,
    createdAt: getDaysAgo(1),
    items: [
      { key: "6", id: 6, name: "Membresía Semanal", description: "Acceso semanal", category: "servicio", stock: null, unitPrice: 10, unitDiscount: 0, quantity: 1, subtotal: 10, source: "MEMBERSHIP" },
    ],
    totals: { subtotal: 10, taxableSubtotal: 10, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 10 },
    client: { documentNumber: "55667788", firstName: "Ana", lastName: "Martínez" },
    payment: { method: "CASH", cashAmount: 10, transferAmount: 0 },
    createdBy: "Recepcionista 1",
  },
  {
    id: 5,
    createdAt: getDaysAgo(1),
    items: [
      { key: "7", id: 7, name: "Proteína", description: "Suplemento proteico", category: "bar", stock: 15, unitPrice: 25, unitDiscount: 0, quantity: 1, subtotal: 25, source: "PRODUCT" },
    ],
    totals: { subtotal: 25, taxableSubtotal: 25, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 25 },
    client: { documentNumber: "99887766", firstName: "Carlos", lastName: "Rodríguez" },
    payment: { method: "TRANSFER", cashAmount: 0, transferAmount: 25 },
    voucherCode: "TRF-003",
    createdBy: "Recepcionista 2",
  },
  {
    id: 6,
    createdAt: getDaysAgo(2),
    items: [
      { key: "8", id: 8, name: "Promo Mensual + Agua", description: "Promoción mensual", category: "servicio", stock: null, unitPrice: 32, unitDiscount: 0, quantity: 1, subtotal: 32, source: "MEMBERSHIP" },
    ],
    totals: { subtotal: 32, taxableSubtotal: 32, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 32 },
    client: { documentNumber: "44332211", firstName: "Laura", lastName: "Fernández" },
    payment: { method: "CASH", cashAmount: 32, transferAmount: 0 },
    createdBy: "Admin",
  },
  {
    id: 7,
    createdAt: getDaysAgo(2),
    items: [
      { key: "9", id: 9, name: "Membresía Diaria", description: "Acceso diario", category: "servicio", stock: null, unitPrice: 5, unitDiscount: 0, quantity: 2, subtotal: 10, source: "MEMBERSHIP" },
      { key: "10", id: 10, name: "Agua", description: "Botella de agua", category: "bar", stock: 50, unitPrice: 1.5, unitDiscount: 0, quantity: 4, subtotal: 6, source: "PRODUCT" },
    ],
    totals: { subtotal: 16, taxableSubtotal: 16, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 16 },
    client: { documentNumber: "66554433", firstName: "Miguel", lastName: "Torres" },
    payment: { method: "MIXED", cashAmount: 10, transferAmount: 6 },
    voucherCode: "TRF-004",
    createdBy: "Recepcionista 1",
  },
  {
    id: 8,
    createdAt: getDaysAgo(3),
    items: [
      { key: "11", id: 11, name: "Bebida", description: "Bebida", category: "bar", stock: 30, unitPrice: 2.5, unitDiscount: 0, quantity: 4, subtotal: 10, source: "PRODUCT" },
    ],
    totals: { subtotal: 10, taxableSubtotal: 10, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 10 },
    client: { documentNumber: "11223355", firstName: "Sofia", lastName: "Jiménez" },
    payment: { method: "TRANSFER", cashAmount: 0, transferAmount: 10 },
    voucherCode: "TRF-005",
    createdBy: "Admin",
  },
  {
    id: 9,
    createdAt: getDaysAgo(4),
    items: [
      { key: "12", id: 12, name: "Membresía Mensual", description: "Acceso mensual", category: "servicio", stock: null, unitPrice: 30, unitDiscount: 0, quantity: 1, subtotal: 30, source: "MEMBERSHIP" },
    ],
    totals: { subtotal: 30, taxableSubtotal: 30, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 30 },
    client: { documentNumber: "77448833", firstName: "Roberto", lastName: "Álvarez" },
    payment: { method: "CASH", cashAmount: 30, transferAmount: 0 },
    createdBy: "Recepcionista 2",
  },
  {
    id: 10,
    createdAt: getDaysAgo(5),
    items: [
      { key: "13", id: 13, name: "Snack", description: "Snack", category: "bar", stock: 20, unitPrice: 2, unitDiscount: 0, quantity: 5, subtotal: 10, source: "PRODUCT" },
    ],
    totals: { subtotal: 10, taxableSubtotal: 10, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 10 },
    client: { documentNumber: "88552244", firstName: "Isabel", lastName: "Morales" },
    payment: { method: "TRANSFER", cashAmount: 0, transferAmount: 10 },
    voucherCode: "TRF-006",
    createdBy: "Recepcionista 1",
  },
  {
    id: 11,
    createdAt: getDaysAgo(6),
    items: [
      { key: "14", id: 14, name: "Membresía Quincenal", description: "Acceso quincenal", category: "servicio", stock: null, unitPrice: 18, unitDiscount: 0, quantity: 1, subtotal: 18, source: "MEMBERSHIP" },
    ],
    totals: { subtotal: 18, taxableSubtotal: 18, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 18 },
    client: { documentNumber: "44332211", firstName: "Laura", lastName: "Fernández" },
    payment: { method: "CASH", cashAmount: 18, transferAmount: 0 },
    createdBy: "Admin",
  },
  {
    id: 12,
    createdAt: getDaysAgo(7),
    items: [
      { key: "15", id: 15, name: "Membresía Diaria", description: "Acceso diario", category: "servicio", stock: null, unitPrice: 5, unitDiscount: 0, quantity: 3, subtotal: 15, source: "MEMBERSHIP" },
    ],
    totals: { subtotal: 15, taxableSubtotal: 15, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 15 },
    client: { documentNumber: "12345678", firstName: "Juan", lastName: "Pérez" },
    payment: { method: "CASH", cashAmount: 15, transferAmount: 0 },
    createdBy: "Recepcionista 1",
  },
  {
    id: 13,
    createdAt: getDaysAgo(8),
    items: [
      { key: "16", id: 16, name: "Bebida Energética", description: "Bebida energizante", category: "bar", stock: 30, unitPrice: 3, unitDiscount: 0, quantity: 2, subtotal: 6, source: "PRODUCT" },
    ],
    totals: { subtotal: 6, taxableSubtotal: 6, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 6 },
    client: { documentNumber: "87654321", firstName: "María", lastName: "García" },
    payment: { method: "TRANSFER", cashAmount: 0, transferAmount: 6 },
    voucherCode: "TRF-007",
    createdBy: "Recepcionista 2",
  },
  {
    id: 14,
    createdAt: getDaysAgo(9),
    items: [
      { key: "17", id: 17, name: "Membresía Mensual", description: "Acceso mensual", category: "servicio", stock: null, unitPrice: 30, unitDiscount: 0, quantity: 1, subtotal: 30, source: "MEMBERSHIP" },
    ],
    totals: { subtotal: 30, taxableSubtotal: 30, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 30 },
    client: { documentNumber: "11223344", firstName: "Pedro", lastName: "López" },
    payment: { method: "MIXED", cashAmount: 15, transferAmount: 15 },
    voucherCode: "TRF-008",
    createdBy: "Admin",
  },
  {
    id: 15,
    createdAt: getDaysAgo(10),
    items: [
      { key: "18", id: 18, name: "Proteína", description: "Suplemento proteico", category: "bar", stock: 15, unitPrice: 25, unitDiscount: 0, quantity: 2, subtotal: 50, source: "PRODUCT" },
    ],
    totals: { subtotal: 50, taxableSubtotal: 50, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 50 },
    client: { documentNumber: "55667788", firstName: "Ana", lastName: "Martínez" },
    payment: { method: "TRANSFER", cashAmount: 0, transferAmount: 50 },
    voucherCode: "TRF-009",
    createdBy: "Recepcionista 1",
  },
  {
    id: 16,
    createdAt: getDaysAgo(11),
    items: [
      { key: "19", id: 19, name: "Membresía Semanal", description: "Acceso semanal", category: "servicio", stock: null, unitPrice: 10, unitDiscount: 0, quantity: 2, subtotal: 20, source: "MEMBERSHIP" },
    ],
    totals: { subtotal: 20, taxableSubtotal: 20, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 20 },
    client: { documentNumber: "99887766", firstName: "Carlos", lastName: "Rodríguez" },
    payment: { method: "CASH", cashAmount: 20, transferAmount: 0 },
    createdBy: "Recepcionista 2",
  },
  {
    id: 17,
    createdAt: getDaysAgo(12),
    items: [
      { key: "20", id: 20, name: "Snack", description: "Snack", category: "bar", stock: 20, unitPrice: 2, unitDiscount: 0, quantity: 6, subtotal: 12, source: "PRODUCT" },
    ],
    totals: { subtotal: 12, taxableSubtotal: 12, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 12 },
    client: { documentNumber: "66554433", firstName: "Miguel", lastName: "Torres" },
    payment: { method: "CASH", cashAmount: 12, transferAmount: 0 },
    createdBy: "Recepcionista 1",
  },
  {
    id: 18,
    createdAt: getDaysAgo(13),
    items: [
      { key: "21", id: 21, name: "Membresía Diaria", description: "Acceso diario", category: "servicio", stock: null, unitPrice: 5, unitDiscount: 0, quantity: 4, subtotal: 20, source: "MEMBERSHIP" },
    ],
    totals: { subtotal: 20, taxableSubtotal: 20, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 20 },
    client: { documentNumber: "11223355", firstName: "Sofia", lastName: "Jiménez" },
    payment: { method: "MIXED", cashAmount: 10, transferAmount: 10 },
    voucherCode: "TRF-010",
    createdBy: "Admin",
  },
  {
    id: 19,
    createdAt: getDaysAgo(14),
    items: [
      { key: "22", id: 22, name: "Membresía Quincenal", description: "Acceso quincenal", category: "servicio", stock: null, unitPrice: 18, unitDiscount: 0, quantity: 1, subtotal: 18, source: "MEMBERSHIP" },
    ],
    totals: { subtotal: 18, taxableSubtotal: 18, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 18 },
    client: { documentNumber: "77448833", firstName: "Roberto", lastName: "Álvarez" },
    payment: { method: "TRANSFER", cashAmount: 0, transferAmount: 18 },
    voucherCode: "TRF-011",
    createdBy: "Recepcionista 2",
  },
  {
    id: 20,
    createdAt: getDaysAgo(15),
    items: [
      { key: "23", id: 23, name: "Bebida", description: "Bebida", category: "bar", stock: 30, unitPrice: 2.5, unitDiscount: 0, quantity: 3, subtotal: 7.5, source: "PRODUCT" },
    ],
    totals: { subtotal: 7.5, taxableSubtotal: 7.5, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 7.5 },
    client: { documentNumber: "88552244", firstName: "Isabel", lastName: "Morales" },
    payment: { method: "CASH", cashAmount: 7.5, transferAmount: 0 },
    createdBy: "Recepcionista 1",
  },
];

const loadSales = (): SaleRecord[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleSales));
    return sampleSales;
  }

  try {
    const parsed = JSON.parse(raw) as SaleRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveSales = (sales: SaleRecord[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
};

export const getSales = (): SaleRecord[] => {
  return loadSales();
};

export const createSale = (input: SaleInput): SaleRecord => {
  const sales = loadSales();
  const nextId = sales.length ? Math.max(...sales.map((sale) => sale.id)) + 1 : 1;

  const record: SaleRecord = {
    id: nextId,
    createdAt: new Date().toISOString(),
    ...input,
  };

  saveSales([...sales, record]);
  return record;
};

export const updateSale = (id: number, update: Partial<SaleRecord>): SaleRecord => {
  const sales = loadSales();
  const index = sales.findIndex((sale) => sale.id === id);

  if (index === -1) {
    throw new Error("Venta no encontrada");
  }

  const updated = { ...sales[index], ...update };
  sales[index] = updated;
  saveSales(sales);
  return updated;
};

export const clearSalesData = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const seedSalesData = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleSales));
};
