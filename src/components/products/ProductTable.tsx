import type { Product } from "../../types/product.types";
import { PRODUCT_CATEGORY_LABELS } from "../../types/product.types";

interface Props {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

const ProductTable = ({ products, onEdit, onDelete }: Props) => {
  return (
    <table className="product-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Descripcion</th>
          <th>Categoria</th>
          <th>Precio unitario</th>
          <th>Cantidad</th>
          <th>Total inventario</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => {
          const total = product.unitPrice * product.quantity;
          return (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>{PRODUCT_CATEGORY_LABELS[product.category]}</td>
              <td>${product.unitPrice.toFixed(2)}</td>
              <td>{product.quantity}</td>
              <td>${total.toFixed(2)}</td>
              <td className="actions">
                <button
                  type="button"
                  className="btn-edit"
                  onClick={() => onEdit(product)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="btn-delete"
                  onClick={() => onDelete(product.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default ProductTable;
