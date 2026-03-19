import { useState } from "react";
import { Plus, X } from "lucide-react";
import ProductForm from "../../components/products/ProductForm";
import ProductSearch from "../../components/products/ProductSearch";
import ProductTable from "../../components/products/ProductTable";
import { useAuth } from "../../context/index.ts";
import { useProducts } from "../../hooks/useProducts";
import type { Product, ProductInput } from "../../types/product.types";
import "../../styles/clientsRegister.css";
import "../../styles/products.css";

const Products = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const {
    products,
    totalProducts,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    error,
    addProduct,
    updateProductById,
    removeProduct,
  } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const totalInventoryValue = products.reduce(
    (sum, product) => sum + product.unitPrice * product.quantity,
    0,
  );

  const openNewForm = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const closeForm = () => {
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleSubmit = (values: ProductInput) => {
    const actionLabel = editingProduct ? "actualizar" : "registrar";
    if (!confirm(`Deseas ${actionLabel} este producto?`)) {
      return;
    }
    try {
      if (editingProduct) {
        updateProductById(editingProduct.id, values);
      } else {
        addProduct(values);
      }
      closeForm();
    } catch {
      // error handled in hook
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Deseas eliminar este producto?")) {
      removeProduct(id);
    }
  };

  return (
    <main className="products-container">
      <section className="products-header">
        <div>
          <h2>Productos</h2>
          <p className="products-subtitle">
            Gestiona el inventario y los servicios del gimnasio.
          </p>
        </div>
        <div className="products-actions">
          <ProductSearch
            value={search}
            onChange={setSearch}
            category={categoryFilter}
            onCategoryChange={setCategoryFilter}
          />
          <button className="product-add-btn" onClick={openNewForm}>
            <Plus size={18} />
            Agregar producto
          </button>
        </div>
      </section>

      <div className="products-stats">
        Total productos: {totalProducts} | Mostrando: {products.length}
        {isAdmin && (
          <span> | Total inventario: ${totalInventoryValue.toFixed(2)}</span>
        )}
      </div>

      <section className="products-list">
        <div className="products-table-wrapper">
          <ProductTable
            products={products}
            onEdit={openEditForm}
            onDelete={handleDelete}
          />
        </div>
      </section>

      {showForm && (
        <div className="product-modal-backdrop" onClick={closeForm}>
          <div
            className="product-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="product-modal-header">
              <div>
                <h3>{editingProduct ? "Editar producto" : "Agregar producto"}</h3>
                <p className="products-subtitle">
                  Completa los datos para registrar el producto.
                </p>
              </div>
              <button className="product-modal-close" onClick={closeForm}>
                <X size={18} />
              </button>
            </div>
            <ProductForm
              idValue={editingProduct?.id ?? null}
              initialValues={editingProduct ?? undefined}
              onSubmit={handleSubmit}
              onCancel={closeForm}
              submitLabel={editingProduct ? "Actualizar" : "Guardar"}
            />
            {error && <p className="form-error">{error}</p>}
          </div>
        </div>
      )}
    </main>
  );
};

export default Products;
