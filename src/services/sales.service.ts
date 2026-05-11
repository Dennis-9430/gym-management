/* Servicio para gestionar ventas y transacciones */
// Direccion del archivo: src/services/sales.service.ts
// Relacionado con: useTransactions.ts, SalesPages.tsx, backend/app/routers/sales.py

import type { SaleInput, SaleRecord } from "../types/sales.types";
import { apiGet, apiPost, apiPut, apiDelete } from "./api";

// Función helper para mapear respuesta de API a SaleRecord
const mapSaleResponse = (sale: any): SaleRecord => ({
  id: sale.id || "",
  // Backend guarda createdAt en UTC pero no incluye "Z".
  // Agregarlo explícitamente para que JS lo parse correctamente como UTC.
  createdAt: (sale.createdAt || new Date().toISOString()).replace(/Z?$/, "Z"),
  items: (sale.items || []).map((item: any) => ({
    key: Date.now().toString() + Math.random(),
    id: item.productId || item.serviceId || 0,
    name: item.productName || item.name || "",
    description: item.description || "",
    category: item.category || "",
    stock: item.stock ?? null,
    unitPrice: item.unitPrice || 0,
    unitDiscount: item.unitDiscount || 0,
    quantity: item.quantity || 1,
    subtotal: item.subtotal || 0,
    source: item.source || "",
    taxRate: item.taxRate ?? 0,
  })),
  totals: {
    subtotal: sale.subtotal || 0,
    taxableSubtotal: sale.subtotal || 0,
    vatSubtotal: 0,
    discountRate: 0,
    discountAmount: 0,
    taxRate: 0,
    taxAmount: sale.tax || 0,
    iceAmount: 0,
    total: sale.total || 0,
  },
  client: {
    documentNumber: sale.clientDocument || "",
    firstName: sale.clientFirstName || "",
    lastName: sale.clientLastName || "",
    email: sale.clientEmail || "",
    phone: sale.clientPhone || "",
    address: sale.clientAddress || "",
  },
  payment: {
    method: sale.paymentMethod || "CASH",
    cashAmount: sale.cashAmount || 0,
    transferAmount: sale.transferAmount || 0,
  },
  paymentStatus: sale.paymentStatus,
  voucherCode: sale.voucherCode,
  createdBy: sale.createdBy,
  generateInvoice: sale.generateInvoice,
  invoiceEmail: sale.invoiceEmail,
});

// Obtiene ventas desde MongoDB
// Relacionado con: backend/app/routers/sales.py (list_sales), useTransactions.ts
export const getSales = async (): Promise<SaleRecord[]> => {
  const data: any = await apiGet("/api/sales?limit=100");
  const sales = data.sales || [];
  return sales.map(mapSaleResponse);
};

// Crea venta en MongoDB
// Relacionado con: backend/app/routers/sales.py (create_sale)
export const createSaleAPI = async (input: SaleInput): Promise<SaleRecord | null> => {
  try {
    // Transformar datos al formato esperado por el backend
    const saleData = {
      items: input.items.map(item => ({
        productId: item.productId || null,
        serviceId: item.serviceId || null,
        productName: item.name,
        description: item.description || null,
        category: item.category || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        unitDiscount: item.unitDiscount || 0,
        subtotal: item.subtotal,
        source: item.source || null,
        taxRate: item.taxRate ?? 0,
      })),
      subtotal: input.totals?.subtotal || 0,
      tax: input.totals?.taxAmount || 0,
      total: input.totals?.total || 0,
      paymentMethod: input.payment?.method || "CASH",
      cashAmount: input.payment?.cashAmount || 0,
      transferAmount: input.payment?.transferAmount || 0,
      clientDocument: input.client?.documentNumber || null,
      clientFirstName: input.client?.firstName || null,
      clientLastName: input.client?.lastName || null,
      clientEmail: input.client?.email || null,
      clientPhone: input.client?.phone || null,
      clientAddress: input.client?.address || null,
      voucherCode: input.voucherCode || null,
      createdBy: input.createdBy || "Sistema",
      generateInvoice: input.generateInvoice || false,
      invoiceEmail: input.invoiceEmail || null,
    };

    const apiResponse: any = await apiPost("/api/sales", saleData);
    return mapSaleResponse(apiResponse);
  } catch (error) {
    return null;
  }
};

// Actualiza venta en MongoDB
export const updateSaleAPI = async (id: string | number, update: Partial<SaleRecord>): Promise<SaleRecord | null> => {
  try {
    // Transformar al formato que espera el backend (SaleUpdate)
    const body: Record<string, unknown> = {};
    if (update.payment) {
      body.paymentMethod = update.payment.method;
      body.cashAmount = update.payment.cashAmount ?? 0;
      body.transferAmount = update.payment.transferAmount ?? 0;
    }
    const response: any = await apiPut(`/api/sales/${id}`, body);
    return response;
  } catch (error) {
    return null;
  }
};

// Actualiza voucher/imagen de una venta
export const updateVoucherAPI = async (saleId: string, voucherCode?: string, voucherImage?: string): Promise<boolean> => {
  try {
    await apiPut(`/api/sales/${saleId}/voucher`, { voucherCode, voucherImage });
    return true;
  } catch (error) {
    return false;
  }
};

// Marca pago como verificado (solo ADMIN)
export const verifyPaymentAPI = async (saleId: string): Promise<boolean> => {
  try {
    await apiPut(`/api/sales/${saleId}/verify`, {});
    return true;
  } catch (error) {
    return false;
  }
};

// Elimina venta en MongoDB (solo GERENTE)
export const deleteSaleAPI = async (saleId: string): Promise<boolean> => {
  try {
    await apiDelete(`/api/sales/${saleId}`);
    return true;
  } catch (error) {
    return false;
  }
};
