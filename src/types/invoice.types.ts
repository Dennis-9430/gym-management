/* Tipos para el sistema de facturación */
export type InvoiceType = "MEMBERSHIP" | "PRODUCT";

export type InvoiceStatus = "DRAFT" | "GENERATED" | "SENT" | "FAILED";

export type PaymentMethodType = "CASH" | "TRANSFER" | "MIXED";

export interface InvoiceBusiness {
  name: string;
  ruc: string;
  address: string;
  phone: string;
  email: string;
}

export interface InvoiceClient {
  documentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface InvoiceItem {
  id?: number;
  code?: string;
  name: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

export interface InvoiceTotals {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  iceAmount: number;
  total: number;
}

export interface InvoicePayment {
  method: PaymentMethodType;
  cashAmount: number;
  transferAmount: number;
  voucherCode?: string;
  paid: number;
  change: number;
}

export interface InvoiceMembershipMeta {
  serviceName: string;
  serviceId?: number;
  startDate: string;
  endDate?: string;
  status: "PAID" | "PENDING";
}

export interface InvoiceEmailDelivery {
  requested: boolean;
  sent: boolean;
  sentAt?: string;
  recipient?: string;
  errorMessage?: string;
}

export interface Invoice {
  id: string;
  type: InvoiceType;
  invoiceNumber: string;
  createdAt: string;
  tenantId: string;
  
  business: InvoiceBusiness;
  client: InvoiceClient;
  
  items: InvoiceItem[];
  totals: InvoiceTotals;
  
  payment: InvoicePayment;
  
  membershipMeta?: InvoiceMembershipMeta;
  
  emailDelivery?: InvoiceEmailDelivery;
  status: InvoiceStatus;
}

export interface InvoiceCreateRequest {
  type: InvoiceType;
  clientId?: string;
  clientDocument: string;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone?: string;
  clientAddress?: string;
  
  items: InvoiceItem[];
  totals: InvoiceTotals;
  payment: InvoicePayment;
  
  membershipMeta?: InvoiceMembershipMeta;
  
  sendEmail: boolean;
}

export interface InvoiceListResponse {
  invoices: Invoice[];
  total: number;
}

export interface InvoiceEmailRequest {
  invoiceId: string;
  recipientEmail: string;
}