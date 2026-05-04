import { useState } from "react";
import { Plus, X } from "lucide-react";
import ProductForm from "../../components/products/ProductForm";
import ProductSearch from "../../components/products/ProductSearch";
import ProductTable from "../../components/products/ProductTable";
import { useAuth } from "../../context/index.ts";
import { useAccountType } from "../../hooks/useAccountType";
import { useProducts } from "../../hooks/useProducts";
import type { Product, ProductInput } from "../../types/product.types";
import "../../styles/products.css";

/* Pagina de gestion de productos e inventario */
const Products = () => {
  const { user } = useAuth();
  const { isOwner } = useAccountType();
  const isAdmin = user?.role === "ADMIN";

  // Gerente y Admin pueden agregar/editar productos
  // Recepcionista NO puede
  const canManageProducts = isOwner || isAdmin;

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

  /**
   * Calcula el valor total del inventario
   * @returns {number} valor total en dinero
   */
  const totalInventoryValue = products.reduce(
    (sum, product) => sum + product.unitPrice * product.quantity,
    0,
  );

  /** Abre formulario para nuevo producto */
  const openNewForm = () => {
    if (!canManageProducts) {
      alert("No tienes permisos para agregar productos.");
      return;
    }
    setEditingProduct(null);
    setShowForm(true);
  };

  /** Abre formulario para editar producto */
  const openEditForm = (product: Product) => {
    if (!canManageProducts) {
      alert("No tienes permisos para editar productos.");
      return;
    }
    setEditingProduct(product);
    setShowForm(true);
  };

  /** Cierra el formulario y limpia el estado */
  const closeForm = () => {
    setEditingProduct(null);
    setShowForm(false);
  };

  /**
   * Maneja el submit del formulario
   * @param {ProductInput} values - datos del producto
   */
  const handleSubmit = (values: ProductInput) => {
    if (!canManageProducts) {
      alert("No tienes permisos para gestionar productos.");
      return;
    }
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
    if (!canManageProducts) {
      alert("No tienes permisos para eliminar productos.");
      return;
    }
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
          {/* Orden real recomendado: búsqueda/filtro primero, CTA al final */}
          <ProductSearch
            value={search}
onChange={setSearch}
            category={categoryFilter}
            onCategoryChange={setCategoryFilter}
          />
          {canManageProducts && (
            <button className="product-add-btn" onClick={openNewForm}>
              <Plus size={18} />
              Agregar producto
            </button>
          )}
        </div>
      </section>

      <div className="products-stats">
        Total productos: {totalProducts} | Mostrando: {products.length}
        {canManageProducts && (
          <span> | Total inventario: ${totalInventoryValue.toFixed(2)}</span>
        )}
      </div>

      <section className="products-list">
        <div className="products-table-wrapper">
          <ProductTable
            products={products}
            onEdit={openEditForm}
            onDelete={handleDelete}
            canManage={canManageProducts}
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
