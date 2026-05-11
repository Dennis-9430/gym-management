import { useMemo, useState, useCallback } from "react";
import type { Product, ProductInput, ProductUpdate, ProductCategory } from "../types/product.types";
import { PRODUCT_CATEGORY_LABELS } from "../types/product.types";
import {
  getProducts,
  createProductAPI,
  updateProductAPI,
  deleteProductAPI,
} from "../services/products.service";

type CategoryFilter = ProductCategory | "ALL";

/* Hook de productos sin fallback local para no duplicar inventario fuera del backend. */
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar productos";
      setError(message);
      throw err;
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
      const categoryLabel = PRODUCT_CATEGORY_LABELS[product.category] ?? product.category;
      return `${product.name} ${product.description} ${categoryLabel} ${product.code}`
        .toLowerCase()
        .includes(query);
    });
  }, [products, search, categoryFilter]);

  const addProduct = async (input: ProductInput) => {
    setError(null);
    try {
      const created = await createProductAPI(input);
      setProducts((prev) => [...prev, created]);
      return created;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      setError(message);
      throw err;
    }
  };

  const updateProductById = async (id: string, update: ProductUpdate) => {
    setError(null);
    try {
      const updated = await updateProductAPI(id, update);
      setProducts((prev) => prev.map((product) => (product.id === id ? updated : product)));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      setError(message);
      throw err;
    }
  };

  const removeProduct = async (id: string) => {
    setError(null);
    try {
      await deleteProductAPI(id);
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
