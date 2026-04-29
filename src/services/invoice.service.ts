/* Servicio para gestionar facturas */
import type { Invoice, InvoiceCreateRequest, InvoiceListResponse, InvoiceEmailRequest } from "../types/invoice.types";
import { apiGet, apiPost, apiDelete } from "./api";

export const getTenantId = () => {
  const tenant = localStorage.getItem("tenant");
  if (!tenant) return null;
  try {
    return JSON.parse(tenant).tenantId;
  } catch {
    return null;
  }
};

const invoiceService = {
  /* Lista de facturas */
  async getInvoices(page = 0, limit = 50): Promise<InvoiceListResponse> {
    const tenantId = getTenantId();
    if (!tenantId) throw new Error("No hay tenant");
    return apiGet(`/api/invoices?tenantId=${tenantId}&skip=${page * limit}&limit=${limit}`);
  },

  /* Obtener una factura por ID */
  async getInvoice(invoiceId: string): Promise<Invoice> {
    return apiGet(`/api/invoices/${invoiceId}`);
  },

  /* Crear una nueva factura */
  async createInvoice(data: InvoiceCreateRequest): Promise<Invoice> {
    return apiPost("/api/invoices", data);
  },

  /* Eliminar una factura */
  async deleteInvoice(invoiceId: string): Promise<void> {
    return apiDelete(`/api/invoices/${invoiceId}`);
  },

  /* Enviar factura por email */
  async sendInvoiceEmail(data: InvoiceEmailRequest): Promise<{ success: boolean; message: string }> {
    return apiPost("/api/invoices/send-email", data);
  },

  /* Generar número de factura siguiente */
  async getNextInvoiceNumber(): Promise<string> {
    const tenantId = getTenantId();
    if (!tenantId) throw new Error("No hay tenant");
    const result = await apiGet(`/api/invoices/next-number?tenantId=${tenantId}`);
    return result as string;
  },
};

export default invoiceService;