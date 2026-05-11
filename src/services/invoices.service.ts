/* Servicio para gestionar facturas */
// Dirección del archivo: src/services/invoices.service.ts
// Relacionado con: useTransactions.ts, backend/app/routers/invoices.py

import { apiGet } from "./api";

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
    const data = await apiGet("/api/invoices?limit=100");
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