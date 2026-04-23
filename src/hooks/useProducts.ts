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

type CategoryFilter = ProductCategory | "ALL";

/* Hook que maneja el estado CRUD de productos con MongoDB */
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Carga productos desde API
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
