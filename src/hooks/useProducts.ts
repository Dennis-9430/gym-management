import { useMemo, useState, useCallback } from "react";
import type { Product, ProductInput, ProductUpdate, ProductCategory } from "../types/product.types";
import { PRODUCT_CATEGORY_LABELS } from "../types/product.types";
import {
  getProducts,
  createProduct,
  createProductAPI,
  updateProduct,
  updateProductAPI,
  deleteProduct,
  deleteProductAPI,
} from "../services/products.service";

/**
 * Tipo que representa el filtro de categoria para productos.
 * Puede ser cualquier categoria de producto o "ALL" para mostrar todos.
 */
type CategoryFilter = ProductCategory | "ALL";

/**
 * Hook personalizados para manejar el estado CRUD de productos con persistencia en MongoDB.
 * Provee funcionalidades para listar, buscar, filtrar, crear, actualizar y eliminar productos.
 * 
 * @returns Objeto con el estado y funciones para gestionar productos
 * 
 * @example
 * ```tsx
 * const {
 *   products,
 *   totalProducts,
 *   search,
 *   setSearch,
 *   categoryFilter,
 *   setCategoryFilter,
 *   error,
 *   loading,
 *   refresh,
 *   addProduct,
 *   updateProductById,
 *   removeProduct
 * } = useProducts();
 * ```
 */
export const useProducts = () => {
  // Estado principal de productos
  const [products, setProducts] = useState<Product[]>([]);
  
  // Estado para la busqueda de productos
  const [search, setSearch] = useState("");
  
  // Estado para el filtro de categoria
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  
  // Estado para manejar errores
  const [error, setError] = useState<string | null>(null);
  
  // Estado de carga
  const [loading, setLoading] = useState(false);

  // Carga productos desde la API
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error cargando productos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoizacion de productos filtrados por busqueda y categoria
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const byCategory = categoryFilter === "ALL"
      ? products
      : products.filter((product) => product.category === categoryFilter);

    if (!query) return byCategory;
    return byCategory.filter((product) => {
      const categoryLabel =
        PRODUCT_CATEGORY_LABELS[product.category] ?? product.category;
      return `${product.name} ${product.description} ${categoryLabel}`
        .toLowerCase()
        .includes(query);
    });
  }, [products, search, categoryFilter]);

  // Crea un nuevo producto, intenta primero con API y fallback local
  const addProduct = async (input: ProductInput) => {
    setError(null);
    try {
      // Intentar API primero
      const created = await createProductAPI(input);
      if (created) {
        setProducts((prev) => [...prev, created].sort((a, b) => a.id - b.id));
        return created;
      }
      // Fallback local
      const createdLocal = createProduct(input);
      setProducts((prev) => [...prev, createdLocal].sort((a, b) => a.id - b.id));
      return createdLocal;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      setError(message);
      throw err;
    }
  };

  // Actualiza un producto existente por ID
  const updateProductById = async (id: number, update: ProductUpdate) => {
    setError(null);
    try {
      // Intentar API primero
      const updated = await updateProductAPI(id, update);
      if (updated) {
        setProducts((prev) =>
          prev.map((product) => (product.id === id ? updated : product)),
        );
        return updated;
      }
      // Fallback local
      const updatedLocal = updateProduct(id, update);
      setProducts((prev) =>
        prev.map((product) => (product.id === id ? updatedLocal : product)),
      );
      return updatedLocal;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      setError(message);
      throw err;
    }
  };

  // Elimina un producto por ID
  const removeProduct = async (id: number) => {
    setError(null);
    try {
      // Intentar API primero
      const deleted = await deleteProductAPI(id);
      if (deleted) {
        setProducts((prev) => prev.filter((product) => product.id !== id));
        return;
      }
      // Fallback local
      deleteProduct(id);
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      setError(message);
      throw err;
    }
  };

  /**
   * Retorna el estado y funciones del hook
   * @typedef {Object} UseProductsReturn
   * @property {Product[]} products - Lista de productos filtrados
   * @property {number} totalProducts - Total de productos sin filtro
   * @property {string} search - Termino de busqueda actual
   * @property {React.Dispatch<React.SetStateAction<string>>} setSearch - Funcion para actualizar busqueda
   * @property {CategoryFilter} categoryFilter - Filtro de categoria actual
   * @property {React.Dispatch<React.SetStateAction<CategoryFilter>>} setCategoryFilter - Funcion para actualizar filtro
   * @property {string | null} error - Mensaje de error si existe
   * @property {boolean} loading - Estado de carga
   * @property {() => Promise<void>} refresh - Funcion para recargar productos
   * @property {(input: ProductInput) => Promise<Product>} addProduct - Funcion para crear producto
   * @property {(id: number, update: ProductUpdate) => Promise<Product>} updateProductById - Funcion para actualizar producto
   * @property {(id: number) => Promise<void>} removeProduct - Funcion para eliminar producto
   */
  return {
    products: filteredProducts,
    totalProducts: products.length,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    error,
    loading,
    refresh,
    addProduct,
    updateProductById,
    removeProduct,
  };
};

