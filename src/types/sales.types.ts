/* Tipos para ventas y transacciones */
import type { DocumentType } from "./client.types";
import type { CartItem, CartTotals } from "./pos.types";

export type PaymentMethod = "CASH" | "TRANSFER" | "DEPOSIT" | "MIXED";

export type PaymentStatus = "pending" | "verified";

export interface SalePayment {
  method: PaymentMethod;
  cashAmount: number;
  transferAmount: number;
}

export interface SaleClientInfo {
  documentNumber: string;
  documentType?: DocumentType;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface SaleRecord {
  id: number;
  createdAt: string;
  items: CartItem[];
  totals: CartTotals;
  client: SaleClientInfo;
  payment: SalePayment;
  voucherCode?: string;
  voucherImage?: string;
  paymentStatus?: PaymentStatus;
  createdBy?: string;
  generateInvoice?: boolean;
  invoiceEmail?: string | null;
}

export type SaleInput = Omit<SaleRecord, "id" | "createdAt">;
