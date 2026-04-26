/* Servicio para gestionar productos y inventario */
// Direccion del archivo: src/services/products.service.ts
// Relacionado con: useProducts.ts, Products.tsx, backend/app/routers/products.py

import type { Product, ProductInput, ProductUpdate } from "../types/product.types";
import { services } from "../types/payment.types";

// Configuración de API - usa variable de entorno o fallback
const getApiBaseUrl = () => import.meta.env.VITE_API_URL || "http://localhost:8000";

// Constantes de configuracion
// Relacionado con: backend/app/routers/products.py
const API_BASE = `${getApiBaseUrl()}/api/products`;
const STORAGE_KEY = "gym-management.products";

// Datos de ejemplo para desarrollo
// Relacionado con: getProducts (fallback)
const seedProducts: Product[] = [
  { id: 1, code: "SUP-001", name: "Whey Protein", description: "Proteina de suero 1kg", category: "SUPLEMENTOS", unitPrice: 35, quantity: 10, minStock: 5, createdAt: new Date().toISOString() },
  { id: 2, code: "BEB-001", name: "Agua", description: "Botella 600ml", category: "BEBIDAS", unitPrice: 1, quantity: 60, minStock: 20, createdAt: new Date().toISOString() },
  { id: 3, code: "ACC-001", name: "Guantes", description: "Guantes de entrenamiento", category: "ACCESORIOS", unitPrice: 12, quantity: 15, minStock: 5, createdAt: new Date().toISOString() },
  { id: 4, code: "ROP-001", name: "Camiseta", description: "Camiseta deportiva", category: "ROPA", unitPrice: 18, quantity: 20, minStock: 5, createdAt: new Date().toISOString() },
  // Incluye servicios como productos
  ...services.map((service, index) => ({ id: 5 + index, code: `SER-00${index + 1}`, name: service.name, description: "Servicio del gimnasio", category: "SERVICIOS_GYM" as const, unitPrice: service.price, quantity: 1, minStock: 0, createdAt: new Date().toISOString() })),
];

// Funciones de manejo de datos locales (Fallback)

/**
 * Carga productos desde localStorage
 * @returns Array de productos
 */
const loadProducts = (): Product[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) { localStorage.setItem(STORAGE_KEY, JSON.stringify(seedProducts)); return seedProducts; }
  try {
    const parsed = JSON.parse(raw) as Product[];
    if (!Array.isArray(parsed)) return seedProducts;
    return parsed;
  } catch { return seedProducts; }
};

/**
 * Guarda productos en localStorage
 * @param products - Array de productos
 */
const saveProducts = (products: Product[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(products));

// Funciones de API (MongoDB)

// Obtiene productos desde MongoDB
// Relacionado con: backend/app/routers/products.py (list_products)
export const getProductsFromAPI = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_BASE}?low_stock=false`);
    if (!response.ok) throw new Error("Error al obtener productos");
    const data = await response.json();
    return data.products || [];
  } catch (error) { console.error("Error cargando productos desde API:", error); throw error; }
};

// Obtiene productos (intenta API, fallback localStorage)
// Relacionado con: useProducts.ts
export const getProducts = async (): Promise<Product[]> => {
  try { return await getProductsFromAPI(); } catch { return [...loadProducts()].sort((a, b) => a.id - b.id); }
};

// Obtiene producto por ID
// Relacionado con: backend/app/routers/products.py (get_product)
export const getProductById = async (id: number): Promise<Product | null> => {
  try {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) throw new Error("Producto no encontrado");
    return await response.json();
  } catch { return loadProducts().find((p) => p.id === id) ?? null; }
};

// Crea producto en MongoDB
// Relacionado con: backend/app/routers/products.py (create_product)
export const createProductAPI = async (input: ProductInput): Promise<Product | null> => {
  try {
    const response = await fetch(API_BASE, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
    if (!response.ok) throw new Error("Error al crear producto");
    return await response.json();
  } catch (error) { console.error("Error creando producto:", error); return null; }
};

// Actualiza producto en MongoDB
// Relacionado con: backend/app/routers/products.py (update_product)
export const updateProductAPI = async (id: number, update: ProductUpdate): Promise<Product | null> => {
  try {
    const response = await fetch(`${API_BASE}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(update) });
    if (!response.ok) throw new Error("Error al actualizar producto");
    return await response.json();
  } catch (error) { console.error("Error actualizando producto:", error); return null; }
};

// Elimina producto en MongoDB
// Relacionado con: backend/app/routers/products.py (delete_product)
export const deleteProductAPI = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    return response.ok;
  } catch (error) { console.error("Error eliminando producto:", error); return false; }
};

// Funciones locales (Fallback)

/**
 * Busca producto por ID en localStorage
 * @param id - ID del producto
 * @returns Producto o null
 */
export const getProductByIdLocal = (id: number): Product | null => loadProducts().find((p) => p.id === id) ?? null;

/**
 * Crea producto en localStorage (fallback)
 * @param input - Datos del producto
 * @returns Producto creado
 */
export const createProduct = (input: ProductInput): Product => {
  const products = loadProducts();
  const nextId = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1;
  const product: Product = { id: nextId, createdAt: new Date().toISOString(), ...input };
  const updated = [...products, product];
  saveProducts(updated);
  return product;
};

/**
 * Actualiza producto en localStorage (fallback)
 * @param id - ID del producto
 * @param update - Campos a actualizar
 * @returns Producto actualizado
 */
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

/**
 * Elimina producto de localStorage (fallback)
 * @param id - ID del producto
 */
export const deleteProduct = (id: number) => saveProducts(loadProducts().filter((p) => p.id !== id));