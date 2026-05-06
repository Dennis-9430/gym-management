/* Tipos para sistema POS (carrito de compras) */
export type CatalogSource = "PRODUCT" | "MEMBERSHIP" | "DAILY";

export interface CatalogItem {
  key: string;
  id: string | number;
  name: string;
  description: string;
  category: string;
  unitPrice: number;
  stock: number | null;
  source: CatalogSource;
  serviceId?: string;
  duration?: number;
  durationUnit?: string;
}

export interface CartItem {
  key: string;
  id: string | number;
  name: string;
  description: string;
  category: string;
  stock: number | null;
  unitPrice: number;
  unitDiscount: number;
  quantity: number;
  subtotal: number;
  source: CatalogSource;
  productId?: string | number | null;
  serviceId?: string | number | null;
}

export interface CartTotals {
  subtotal: number;
  taxableSubtotal: number;
  vatSubtotal: number;
  discountRate: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  iceAmount: number;
  total: number;
}


