export type ProductCategory =
  | "SUPLEMENTOS"
  | "BEBIDAS"
  | "ACCESORIOS"
  | "ROPA"
  | "SERVICIOS_GYM";

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "SUPLEMENTOS",
  "BEBIDAS",
  "ACCESORIOS",
  "ROPA",
  "SERVICIOS_GYM",
];

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  SUPLEMENTOS: "Suplementos",
  BEBIDAS: "Bebidas",
  ACCESORIOS: "Accesorios",
  ROPA: "Ropa",
  SERVICIOS_GYM: "Servicios del gym",
};

export interface Product {
  price?: number;
  stock?: number;
  id: number;
  name: string;
  description: string;
  category: ProductCategory;
  unitPrice: number;
  quantity: number;
  createdAt: string;
}

export type ProductInput = Omit<Product, "id" | "createdAt">;
export type ProductUpdate = Partial<ProductInput>;
