/* Servicio para gestionar ventas y transacciones */
// Direccion del archivo: src/services/sales.service.ts
// Relacionado con: useTransactions.ts, SalesPages.tsx, backend/app/routers/sales.py

import type { SaleInput, SaleRecord } from "../types/sales.types";

// Configuración de API - usa variable de entorno o fallback
const getApiBaseUrl = () => import.meta.env.VITE_API_URL || "http://localhost:8000";

// Constantes de configuracion
// Relacionado con: backend/app/routers/sales.py
const API_BASE = `${getApiBaseUrl()}/api/sales`;
const STORAGE_KEY = "gym-management.sales";

// Funciones helper de fechas

/**
 * Calcula la fecha de hace N dias
 * @param days - Numero de dias hacia atras
 * @returns Fecha en formato ISO
 */
const getDaysAgo = (days: number) => {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
};

/**
 * Convierte fecha (year, month, day) a formato ISO
 * @param year - Año
 * @param month - Mes (1-12)
 * @param day - Dia
 * @returns Fecha en formato ISO
 */
const getDateString = (year: number, month: number, day: number) => {
  return new Date(year, month - 1, day).toISOString();
};

// Datos de ejemplo para desarrollo
// Relacionado con: getSales (fallback)
const sampleSales: SaleRecord[] = [
  // ABRIL 2026 (mes actual)
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
    createdAt: getDaysAgo(3),
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
    createdAt: getDaysAgo(4),
    items: [
      { key: "11", id: 11, name: "Bebida", description: "Bebida", category: "bar", stock: 30, unitPrice: 2.5, unitDiscount: 0, quantity: 4, subtotal: 10, source: "PRODUCT" },
    ],
    totals: { subtotal: 10, taxableSubtotal: 10, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 10 },
    client: { documentNumber: "11223355", firstName: "Sofia", lastName: "Jiménez" },
    payment: { method: "TRANSFER", cashAmount: 0, transferAmount: 10 },
    voucherCode: "TRF-005",
    createdBy: "Admin",
  },
  // MARZO 2026
  {
    id: 9,
    createdAt: getDateString(2026, 3, 1),
    items: [
      { key: "12", id: 12, name: "Membresía Mensual", description: "Acceso mensual", category: "servicio", stock: null, unitPrice: 30, unitDiscount: 0, quantity: 1, subtotal: 30, source: "MEMBERSHIP" },
    ],
    totals: { subtotal: 30, taxableSubtotal: 30, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 30 },
    client: { documentNumber: "12345678", firstName: "Juan", lastName: "Pérez" },
    payment: { method: "CASH", cashAmount: 30, transferAmount: 0 },
    createdBy: "Recepcionista 1",
  },
  {
    id: 10,
    createdAt: getDateString(2026, 3, 5),
    items: [
      { key: "13", id: 13, name: "Membresía Quincenal", description: "Acceso quincenal", category: "servicio", stock: null, unitPrice: 18, unitDiscount: 0, quantity: 1, subtotal: 18, source: "MEMBERSHIP" },
    ],
    totals: { subtotal: 18, taxableSubtotal: 18, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 18 },
    client: { documentNumber: "87654321", firstName: "María", lastName: "García" },
    payment: { method: "TRANSFER", cashAmount: 0, transferAmount: 18 },
    voucherCode: "TRF-006",
    createdBy: "Recepcionista 2",
  },
  {
    id: 11,
    createdAt: getDateString(2026, 3, 10),
    items: [
      { key: "14", id: 14, name: "Proteína", description: "Suplemento proteico", category: "bar", stock: 15, unitPrice: 25, unitDiscount: 0, quantity: 2, subtotal: 50, source: "PRODUCT" },
    ],
    totals: { subtotal: 50, taxableSubtotal: 50, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 50 },
    client: { documentNumber: "55667788", firstName: "Ana", lastName: "Martínez" },
    payment: { method: "TRANSFER", cashAmount: 0, transferAmount: 50 },
    voucherCode: "TRF-007",
    createdBy: "Recepcionista 1",
  },
  {
    id: 12,
    createdAt: getDateString(2026, 3, 15),
    items: [
      { key: "15", id: 15, name: "Membresía Semanal", description: "Acceso semanal", category: "servicio", stock: null, unitPrice: 10, unitDiscount: 0, quantity: 3, subtotal: 30, source: "MEMBERSHIP" },
      { key: "16", id: 16, name: "Bebida Energética", description: "Bebida energizante", category: "bar", stock: 30, unitPrice: 3, unitDiscount: 0, quantity: 3, subtotal: 9, source: "PRODUCT" },
    ],
    totals: { subtotal: 39, taxableSubtotal: 39, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 39 },
    client: { documentNumber: "99887766", firstName: "Carlos", lastName: "Rodríguez" },
    payment: { method: "MIXED", cashAmount: 20, transferAmount: 19 },
    voucherCode: "TRF-008",
    createdBy: "Recepcionista 2",
  },
  {
    id: 13,
    createdAt: getDateString(2026, 3, 20),
    items: [
      { key: "17", id: 17, name: "Snack", description: "Snack proteico", category: "bar", stock: 20, unitPrice: 2.5, unitDiscount: 0, quantity: 4, subtotal: 10, source: "PRODUCT" },
    ],
    totals: { subtotal: 10, taxableSubtotal: 10, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 10 },
    client: { documentNumber: "11223344", firstName: "Pedro", lastName: "López" },
    payment: { method: "CASH", cashAmount: 10, transferAmount: 0 },
    createdBy: "Admin",
  },
  {
    id: 14,
    createdAt: getDateString(2026, 3, 25),
    items: [
      { key: "18", id: 18, name: "Membresía Diaria", description: "Acceso diario", category: "servicio", stock: null, unitPrice: 5, unitDiscount: 0, quantity: 5, subtotal: 25, source: "MEMBERSHIP" },
    ],
    totals: { subtotal: 25, taxableSubtotal: 25, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 25 },
    client: { documentNumber: "66554433", firstName: "Miguel", lastName: "Torres" },
    payment: { method: "CASH", cashAmount: 25, transferAmount: 0 },
    createdBy: "Recepcionista 1",
  },
  {
    id: 15,
    createdAt: getDateString(2026, 3, 28),
    items: [
      { key: "19", id: 19, name: "Promo Mensual + Agua", description: "Promoción mensual", category: "servicio", stock: null, unitPrice: 32, unitDiscount: 0, quantity: 1, subtotal: 32, source: "MEMBERSHIP" },
    ],
    totals: { subtotal: 32, taxableSubtotal: 32, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 32 },
    client: { documentNumber: "44332211", firstName: "Laura", lastName: "Fernández" },
    payment: { method: "TRANSFER", cashAmount: 0, transferAmount: 32 },
    voucherCode: "TRF-009",
    createdBy: "Recepcionista 2",
  },
  // FEBRERO 2026
  {
    id: 16,
    createdAt: getDateString(2026, 2, 2),
    items: [
      { key: "20", id: 20, name: "Membresía Mensual", description: "Acceso mensual", category: "servicio", stock: null, unitPrice: 30, unitDiscount: 0, quantity: 1, subtotal: 30, source: "MEMBERSHIP" },
    ],
    totals: { subtotal: 30, taxableSubtotal: 30, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 30 },
    client: { documentNumber: "12345678", firstName: "Juan", lastName: "Pérez" },
    payment: { method: "CASH", cashAmount: 30, transferAmount: 0 },
    createdBy: "Recepcionista 1",
  },
  {
    id: 17,
    createdAt: getDateString(2026, 2, 8),
    items: [
      { key: "21", id: 21, name: "Membresía Quincenal", description: "Acceso quincenal", category: "servicio", stock: null, unitPrice: 18, unitDiscount: 0, quantity: 2, subtotal: 36, source: "MEMBERSHIP" },
    ],
    totals: { subtotal: 36, taxableSubtotal: 36, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 36 },
    client: { documentNumber: "87654321", firstName: "María", lastName: "García" },
    payment: { method: "TRANSFER", cashAmount: 0, transferAmount: 36 },
    voucherCode: "TRF-010",
    createdBy: "Recepcionista 2",
  },
  {
    id: 18,
    createdAt: getDateString(2026, 2, 14),
    items: [
      { key: "22", id: 22, name: "Bebida Energética", description: "Bebida energizante", category: "bar", stock: 30, unitPrice: 3, unitDiscount: 0, quantity: 5, subtotal: 15, source: "PRODUCT" },
      { key: "23", id: 23, name: "Snack", description: "Snack proteico", category: "bar", stock: 20, unitPrice: 2.5, unitDiscount: 0, quantity: 4, subtotal: 10, source: "PRODUCT" },
    ],
    totals: { subtotal: 25, taxableSubtotal: 25, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 25 },
    client: { documentNumber: "11223344", firstName: "Pedro", lastName: "López" },
    payment: { method: "MIXED", cashAmount: 15, transferAmount: 10 },
    voucherCode: "TRF-011",
    createdBy: "Admin",
  },
  {
    id: 19,
    createdAt: getDateString(2026, 2, 20),
    items: [
      { key: "24", id: 24, name: "Membresía Semanal", description: "Acceso semanal", category: "servicio", stock: null, unitPrice: 10, unitDiscount: 0, quantity: 2, subtotal: 20, source: "MEMBERSHIP" },
    ],
    totals: { subtotal: 20, taxableSubtotal: 20, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 20 },
    client: { documentNumber: "55667788", firstName: "Ana", lastName: "Martínez" },
    payment: { method: "CASH", cashAmount: 20, transferAmount: 0 },
    createdBy: "Recepcionista 1",
  },
  {
    id: 20,
    createdAt: getDateString(2026, 2, 25),
    items: [
      { key: "25", id: 25, name: "Proteína", description: "Suplemento proteico", category: "bar", stock: 15, unitPrice: 25, unitDiscount: 0, quantity: 1, subtotal: 25, source: "PRODUCT" },
    ],
    totals: { subtotal: 25, taxableSubtotal: 25, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 25 },
    client: { documentNumber: "99887766", firstName: "Carlos", lastName: "Rodríguez" },
    payment: { method: "TRANSFER", cashAmount: 0, transferAmount: 25 },
    voucherCode: "TRF-012",
    createdBy: "Recepcionista 2",
  },
  // ENERO 2026
  {
    id: 21,
    createdAt: getDateString(2026, 1, 5),
    items: [
      { key: "26", id: 26, name: "Membresía Mensual", description: "Acceso mensual", category: "servicio", stock: null, unitPrice: 30, unitDiscount: 0, quantity: 1, subtotal: 30, source: "MEMBERSHIP" },
    ],
    totals: { subtotal: 30, taxableSubtotal: 30, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 30 },
    client: { documentNumber: "12345678", firstName: "Juan", lastName: "Pérez" },
    payment: { method: "CASH", cashAmount: 30, transferAmount: 0 },
    createdBy: "Recepcionista 1",
  },
  {
    id: 22,
    createdAt: getDateString(2026, 1, 12),
    items: [
      { key: "27", id: 27, name: "Membresía Quincenal", description: "Acceso quincenal", category: "servicio", stock: null, unitPrice: 18, unitDiscount: 0, quantity: 1, subtotal: 18, source: "MEMBERSHIP" },
    ],
    totals: { subtotal: 18, taxableSubtotal: 18, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 18 },
    client: { documentNumber: "87654321", firstName: "María", lastName: "García" },
    payment: { method: "TRANSFER", cashAmount: 0, transferAmount: 18 },
    voucherCode: "TRF-013",
    createdBy: "Recepcionista 2",
  },
  {
    id: 23,
    createdAt: getDateString(2026, 1, 18),
    items: [
      { key: "28", id: 28, name: "Bebida", description: "Bebida", category: "bar", stock: 30, unitPrice: 2.5, unitDiscount: 0, quantity: 6, subtotal: 15, source: "PRODUCT" },
    ],
    totals: { subtotal: 15, taxableSubtotal: 15, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 15 },
    client: { documentNumber: "11223344", firstName: "Pedro", lastName: "López" },
    payment: { method: "CASH", cashAmount: 15, transferAmount: 0 },
    createdBy: "Admin",
  },
  {
    id: 24,
    createdAt: getDateString(2026, 1, 25),
    items: [
      { key: "29", id: 29, name: "Membresía Semanal", description: "Acceso semanal", category: "servicio", stock: null, unitPrice: 10, unitDiscount: 0, quantity: 4, subtotal: 40, source: "MEMBERSHIP" },
      { key: "30", id: 30, name: "Agua", description: "Botella de agua", category: "bar", stock: 50, unitPrice: 1.5, unitDiscount: 0, quantity: 5, subtotal: 7.5, source: "PRODUCT" },
    ],
    totals: { subtotal: 47.5, taxableSubtotal: 47.5, vatSubtotal: 0, discountRate: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, iceAmount: 0, total: 47.5 },
    client: { documentNumber: "66554433", firstName: "Miguel", lastName: "Torres" },
    payment: { method: "MIXED", cashAmount: 25, transferAmount: 22.5 },
    voucherCode: "TRF-014",
    createdBy: "Recepcionista 1",
  },
];

const loadSales = (): SaleRecord[] => {
  // Carga ventas desde localStorage
  // Relacionado con: getSales (fallback)
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleSales));
    return sampleSales;
  }

  try {
    const parsed = JSON.parse(raw) as SaleRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Manejo de errores para parsing de JSON
    // Relacionado con: localStorage corrupto
    return [];
  }
};

// Funciones de manejo de datos locales (Fallback)

/**
 * Guarda ventas en localStorage
 * @param sales - Array de ventas a guardar
 */
export const saveSalesLocally = (sales: SaleRecord[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
};

// Funciones de API (MongoDB)

// Obtiene ventas desde MongoDB
// Relacionado con: backend/app/routers/sales.py (list_sales)
export const getSalesFromAPI = async (): Promise<SaleRecord[]> => {
  try {
    const response = await fetch(`${API_BASE}?limit=100`);
    if (!response.ok) {
      throw new Error("Error al obtener ventas");
    }
    const data = await response.json();
    return data.sales || [];
  } catch (error) {
    console.error("Error cargando ventas desde API:", error);
    throw error;
  }
};

// Obtiene ventas (intenta API, fallback localStorage)
// Relacionado con: useTransactions.ts
export const getSales = async (): Promise<SaleRecord[]> => {
  try {
    return await getSalesFromAPI();
  } catch {
    return loadSales();
  }
};

// Crea venta en MongoDB
// Relacionado con: backend/app/routers/sales.py (create_sale)
export const createSaleAPI = async (input: SaleInput): Promise<SaleRecord | null> => {
  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      throw new Error("Error al crear venta");
    }
    return await response.json();
  } catch (error) {
    console.error("Error creando venta:", error);
    return null;
  }
};

// Actualiza venta en MongoDB
export const updateSaleAPI = async (id: number, update: Partial<SaleRecord>): Promise<SaleRecord | null> => {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });
    if (!response.ok) {
      throw new Error("Error al actualizar venta");
    }
    return await response.json();
  } catch (error) {
    console.error("Error actualizando venta:", error);
    return null;
  }
};

export const clearSalesData = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const seedSalesData = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleSales));
};
