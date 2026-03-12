import { useState } from "react";
import ProductForm from "../../components/products/ProductForm";
import ProductSearch from "../../components/products/ProductSearch";
import ProductTable from "../../components/products/ProductTable";
import { useProducts } from "../../hooks/useProducts";
import type { Product, ProductInput } from "../../types/product.types";
import "../../styles/clientsRegister.css";
import "../../styles/products.css";

const Products = () => {
  const {
    products,
    totalProducts,
    search,
    setSearch,
    error,
    addProduct,
    updateProductById,
    removeProduct,
  } = useProducts();
  const [activeTab, setActiveTab] = useState<"add" | "list">("list");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const totalInventoryValue = products.reduce(
    (sum, product) => sum + product.unitPrice * product.quantity,
    0,
  );

  const handleSubmit = (values: ProductInput) => {
    try {
      if (editingProduct) {
        updateProductById(editingProduct.id, values);
        setEditingProduct(null);
      } else {
        addProduct(values);
      }
      setActiveTab("list");
    } catch {
      // error handled in hook
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setActiveTab("add");
  };

  const handleDelete = (id: number) => {
    if (confirm("Deseas eliminar este producto?")) {
      removeProduct(id);
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  return (
    <main className="products-container">
      <div className="products-tabs">
        <button
          className={activeTab === "add" ? "active-tab" : ""}
          onClick={() => setActiveTab("add")}
        >
          Agregar
        </button>
        <button
          className={activeTab === "list" ? "active-tab" : ""}
          onClick={() => setActiveTab("list")}
        >
          Lista
        </button>
      </div>

      {activeTab === "add" && (
        <div className="register-container">
          <div className="register-card">
            <h2>{editingProduct ? "Editar producto" : "Agregar producto"}</h2>
            <ProductForm
              initialValues={editingProduct ?? undefined}
              onSubmit={handleSubmit}
              onCancel={editingProduct ? handleCancelEdit : undefined}
              submitLabel={editingProduct ? "Actualizar" : "Guardar"}
            />
            {error && <p className="form-error">{error}</p>}
          </div>
        </div>
      )}

      {activeTab === "list" && (
        <section className="products-list">
          <ProductSearch value={search} onChange={setSearch} />
          <div className="products-stats">
            Total productos: {totalProducts} | Mostrando: {products.length} | 
            Total inventario: ${totalInventoryValue.toFixed(2)}
          </div>
          <div className="products-table-wrapper">
            <ProductTable
              products={products}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </section>
      )}
    </main>
  );
};

export default Products;
