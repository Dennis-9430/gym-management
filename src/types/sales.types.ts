import type { DocumentType } from "./client.types";
import type { CartItem, CartTotals } from "./pos.types";

export type PaymentMethod = "CASH" | "TRANSFER" | "MIXED";

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
  createdBy?: string;
}

export type SaleInput = Omit<SaleRecord, "id" | "createdAt">;
