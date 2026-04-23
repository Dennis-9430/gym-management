import type { Product, ProductInput, ProductUpdate } from "../types/product.types";
import { services } from "../types/payment.types";

const API_BASE = "/api/products";
const STORAGE_KEY = "gym-management.products";

const seedProducts: Product[] = [
  { id: 1, code: "SUP-001", name: "Whey Protein", description: "Proteina de suero 1kg", category: "SUPLEMENTOS", unitPrice: 35, quantity: 10, minStock: 5, createdAt: new Date().toISOString() },
  { id: 2, code: "BEB-001", name: "Agua", description: "Botella 600ml", category: "BEBIDAS", unitPrice: 1, quantity: 60, minStock: 20, createdAt: new Date().toISOString() },
  { id: 3, code: "ACC-001", name: "Guantes", description: "Guantes de entrenamiento", category: "ACCESORIOS", unitPrice: 12, quantity: 15, minStock: 5, createdAt: new Date().toISOString() },
  { id: 4, code: "ROP-001", name: "Camiseta", description: "Camiseta deportiva", category: "ROPA", unitPrice: 18, quantity: 20, minStock: 5, createdAt: new Date().toISOString() },
  ...services.map((service, index) => ({ id: 5 + index, code: `SER-00${index + 1}`, name: service.name, description: "Servicio del gimnasio", category: "SERVICIOS_GYM" as const, unitPrice: service.price, quantity: 1, minStock: 0, createdAt: new Date().toISOString() })),
];

const loadProducts = (): Product[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) { localStorage.setItem(STORAGE_KEY, JSON.stringify(seedProducts)); return seedProducts; }
  try {
    const parsed = JSON.parse(raw) as Product[];
    if (!Array.isArray(parsed)) return seedProducts;
    return parsed;
  } catch { return seedProducts; }
};

const saveProducts = (products: Product[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(products));

export const getProductsFromAPI = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_BASE}?low_stock=false`);
    if (!response.ok) throw new Error("Error al obtener productos");
    const data = await response.json();
    return data.products || [];
  } catch (error) { console.error("Error cargando productos desde API:", error); throw error; }
};

export const getProducts = async (): Promise<Product[]> => {
  try { return await getProductsFromAPI(); } catch { return [...loadProducts()].sort((a, b) => a.id - b.id); }
};

export const getProductById = async (id: number): Promise<Product | null> => {
  try {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) throw new Error("Producto no encontrado");
    return await response.json();
  } catch { return loadProducts().find((p) => p.id === id) ?? null; }
};

export const createProductAPI = async (input: ProductInput): Promise<Product | null> => {
  try {
    const response = await fetch(API_BASE, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
    if (!response.ok) throw new Error("Error al crear producto");
    return await response.json();
  } catch (error) { console.error("Error creando producto:", error); return null; }
};

export const updateProductAPI = async (id: number, update: ProductUpdate): Promise<Product | null> => {
  try {
    const response = await fetch(`${API_BASE}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(update) });
    if (!response.ok) throw new Error("Error al actualizar producto");
    return await response.json();
  } catch (error) { console.error("Error actualizando producto:", error); return null; }
};

export const deleteProductAPI = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    return response.ok;
  } catch (error) { console.error("Error eliminando producto:", error); return false; }
};

export const getProductByIdLocal = (id: number): Product | null => loadProducts().find((p) => p.id === id) ?? null;

export const createProduct = (input: ProductInput): Product => {
  const products = loadProducts();
  const nextId = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1;
  const product: Product = { id: nextId, createdAt: new Date().toISOString(), ...input };
  const updated = [...products, product];
  saveProducts(updated);
  return product;
};

export const updateProduct = (id: number, update: ProductUpdate): Product => {
  const products = loadProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) throw new Error("Producto no encontrado");
  const updatedProduct: Product = { ...products[index], ...update };
  const updatedProducts = [...products];
  updatedProducts[index] = updatedProduct;
  saveProducts(updatedProducts);
  return updatedProduct;
};

export const deleteProduct = (id: number) => saveProducts(loadProducts().filter((p) => p.id !== id));