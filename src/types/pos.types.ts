export type CatalogSource = "PRODUCT" | "MEMBERSHIP";

export interface CatalogItem {
  key: string;
  id: number;
  name: string;
  description: string;
  category: string;
  unitPrice: number;
  stock: number | null;
  source: CatalogSource;
}

export interface CartItem {
  key: string;
  id: number;
  name: string;
  category: string;
  stock: number | null;
  unitPrice: number;
  unitDiscount: number;
  quantity: number;
  subtotal: number;
  source: CatalogSource;
}

export interface CartTotals {
  subtotal: number;
  discountRate: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}
