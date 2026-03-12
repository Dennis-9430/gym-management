import { useEffect, useMemo, useState } from "react";
import type { Product, ProductInput, ProductUpdate, ProductCategory } from "../types/product.types";
import { PRODUCT_CATEGORY_LABELS } from "../types/product.types";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/products.service";

type CategoryFilter = ProductCategory | "ALL";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    setProducts(getProducts());
  };

  useEffect(() => {
    refresh();
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

  const addProduct = (input: ProductInput) => {
    setError(null);
    try {
      const created = createProduct(input);
      setProducts((prev) => [...prev, created].sort((a, b) => a.id - b.id));
      return created;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      setError(message);
      throw err;
    }
  };

  const updateProductById = (id: number, update: ProductUpdate) => {
    setError(null);
    try {
      const updated = updateProduct(id, update);
      setProducts((prev) =>
        prev.map((product) => (product.id === id ? updated : product)),
      );
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      setError(message);
      throw err;
    }
  };

  const removeProduct = (id: number) => {
    deleteProduct(id);
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  return {
    products: filteredProducts,
    totalProducts: products.length,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    error,
    refresh,
    addProduct,
    updateProductById,
    removeProduct,
  };
};
