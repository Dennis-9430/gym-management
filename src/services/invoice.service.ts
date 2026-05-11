/* Servicio para gestionar facturas */
import type { Invoice, InvoiceCreateRequest, InvoiceListResponse, InvoiceEmailRequest } from "../types/invoice.types";
import { apiGet, apiPost, apiDelete } from "./api";

const invoiceService = {
  /* Lista de facturas */
  async getInvoices(page = 0, limit = 50): Promise<InvoiceListResponse> {
    return apiGet(`/api/invoices?skip=${page * limit}&limit=${limit}`);
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
    const result = await apiGet("/api/invoices/next-number");
    return result as string;
  },
};

export default invoiceService;