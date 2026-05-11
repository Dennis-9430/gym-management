/* Servicio unificado para gestionar facturas */
import type {
  Invoice,
  InvoiceCreateRequest,
  InvoiceEmailRequest,
  InvoiceListResponse,
} from "../types/invoice.types";
import { apiDelete, apiGet, apiPost } from "./api";

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
    paid: number;
    change: number;
  };
  status: string;
  createdAt: string;
}

const normalizeCreatedAt = <T extends { createdAt: string }>(value: T): T => ({
  ...value,
  createdAt: (value.createdAt || new Date().toISOString()).replace(/Z?$/, "Z"),
});

export const listInvoices = async (page = 0, limit = 50): Promise<InvoiceListResponse> => {
  const response = (await apiGet(`/api/invoices?skip=${page * limit}&limit=${limit}`)) as InvoiceListResponse;
  return {
    ...response,
    invoices: response.invoices.map((invoice) => normalizeCreatedAt(invoice)),
  };
};

export const getInvoiceById = async (invoiceId: string): Promise<Invoice> =>
  normalizeCreatedAt((await apiGet(`/api/invoices/${invoiceId}`)) as Invoice);

export const createInvoice = async (data: InvoiceCreateRequest): Promise<Invoice> =>
  normalizeCreatedAt((await apiPost("/api/invoices", data)) as Invoice);

export const deleteInvoiceById = async (invoiceId: string): Promise<void> => {
  await apiDelete(`/api/invoices/${invoiceId}`);
};

export const sendInvoiceEmail = async (
  data: InvoiceEmailRequest,
): Promise<{ success: boolean; message: string }> =>
  (await apiPost("/api/invoices/send-email", data)) as { success: boolean; message: string };

export const getNextInvoiceNumber = async (): Promise<string> =>
  (await apiGet("/api/invoices/next-number")) as string;

export const getInvoicesFromAPI = async (): Promise<InvoiceRecord[]> => {
  const response = await listInvoices(0, 100);
  return response.invoices.map((invoice) => ({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    type: invoice.type,
    client: invoice.client,
    items: invoice.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
    })),
    totals: {
      subtotal: invoice.totals.subtotal,
      discountAmount: invoice.totals.discountAmount,
      taxAmount: invoice.totals.taxAmount,
      total: invoice.totals.total,
    },
    payment: {
      method: invoice.payment.method,
      cashAmount: invoice.payment.cashAmount,
      transferAmount: invoice.payment.transferAmount,
      paid: invoice.payment.paid,
      change: invoice.payment.change,
    },
    status: invoice.status,
    createdAt: invoice.createdAt,
  }));
};

const invoiceService = {
  getInvoices: listInvoices,
  getInvoice: getInvoiceById,
  createInvoice,
  deleteInvoice: deleteInvoiceById,
  sendInvoiceEmail,
  getNextInvoiceNumber,
};

export default invoiceService;
