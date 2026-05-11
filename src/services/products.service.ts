/* Servicio de productos alineado al backend como fuente de verdad */
// Direccion del archivo: src/services/products.service.ts
// Relacionado con: useProducts.ts, Products.tsx, backend/app/routers/products.py

import type { Product, ProductInput, ProductUpdate } from "../types/product.types";
import { apiGet, apiPost, apiPut, apiDelete } from "./api";

const PRODUCTS_ENDPOINT = "/api/products";

/* El backend persiste stock; el frontend mantiene quantity para el formulario. */
const mapApiProduct = (product: Record<string, unknown>): Product => ({
  id: String(product.id ?? product._id ?? ""),
  code: String(product.code ?? ""),
  name: String(product.name ?? ""),
  description: String(product.description ?? ""),
  category: (product.category as Product["category"]) ?? "SUPLEMENTOS",
  unitPrice: Number(product.unitPrice ?? 0),
  taxRate: Number(product.taxRate ?? 0),
  quantity: Number(product.stock ?? product.quantity ?? 0),
  minStock: Number(product.minStock ?? 0),
  createdAt: String(product.createdAt ?? new Date().toISOString()),
});

const toApiPayload = (input: ProductInput | ProductUpdate) => {
  const payload: Record<string, unknown> = { ...input };
  if ("quantity" in payload) {
    payload.stock = payload.quantity;
    delete payload.quantity;
  }
  return payload;
};

export const getProducts = async (): Promise<Product[]> => {
  const data = await apiGet(`${PRODUCTS_ENDPOINT}?low_stock=false`) as { products?: Record<string, unknown>[] };
  return (data.products ?? []).map(mapApiProduct);
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const data = await apiGet(`${PRODUCTS_ENDPOINT}/${id}`);
  return mapApiProduct(data as Record<string, unknown>);
};

export const createProductAPI = async (input: ProductInput): Promise<Product> => {
  const data = await apiPost(PRODUCTS_ENDPOINT, toApiPayload(input));
  return mapApiProduct(data as Record<string, unknown>);
};

export const updateProductAPI = async (
  id: string,
  update: ProductUpdate,
): Promise<Product> => {
  const data = await apiPut(`${PRODUCTS_ENDPOINT}/${id}`, toApiPayload(update));
  return mapApiProduct(data as Record<string, unknown>);
};

export const deleteProductAPI = async (id: string): Promise<void> => {
  await apiDelete(`${PRODUCTS_ENDPOINT}/${id}`);
};
