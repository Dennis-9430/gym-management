/* Servicio para gestionar facturas */
// Dirección del archivo: src/services/invoices.service.ts
// Relacionado con: useTransactions.ts, backend/app/routers/invoices.py

import { getAuthToken } from "./api";

// Configuración de API
const getApiBaseUrl = () => import.meta.env.VITE_API_URL || "";
const API_BASE = getApiBaseUrl() ? `${getApiBaseUrl()}/api/invoices` : "/api/invoices";

// Función helper para obtener headers con token
const getHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

/**
 * Datos de una factura
 */
export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  type: "MEMBERSHIP" | "PRODUCT";
  client: {
    documentNumber: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  totals: {
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    total: number;
  };
  payment: {
    method: "CASH" | "TRANSFER" | "MIXED";
    cashAmount: number;
    transferAmount: number;
  };
  status: string;
  createdBy: string;
  createdAt: string;
}

/**
 * Obtiene facturas desde MongoDB
 * Relacionado con: backend/app/routers/invoices.py (list_invoices)
 */
export const getInvoicesFromAPI = async (): Promise<InvoiceRecord[]> => {
  try {
    const response = await fetch(`${API_BASE}?limit=100`, { headers: getHeaders() });
    if (!response.ok) {
      throw new Error("Error al obtener facturas");
    }
    const data = await response.json();
    const invoices = data.invoices || [];
    // Backend guarda createdAt en UTC sin "Z". Agregarlo para parse correcto.
    return invoices.map((inv: InvoiceRecord) => ({
      ...inv,
      createdAt: (inv.createdAt || new Date().toISOString()).replace(/Z?$/, "Z"),
    }));
  } catch (error) {
    return [];
  }
};