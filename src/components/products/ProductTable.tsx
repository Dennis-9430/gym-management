import { Pencil, Trash2 } from "lucide-react";
import type { Product } from "../../types/product.types";
import { PRODUCT_CATEGORY_LABELS } from "../../types/product.types";

/* Tabla de productos con acciones de editar y eliminar */
interface Props {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  canManage?: boolean; // true si puede editar/eliminar productos
}

const ProductTable = ({ products, onEdit, onDelete, canManage = true }: Props) => {
  return (
    <table className="product-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Cod.</th>
          <th>Nombre</th>
          <th>Categoria</th>
          <th>IVA</th>
          <th>PVP</th>
          <th>Base</th>
          <th>IVA $</th>
          <th>Cant.</th>
          <th>Total inv.</th>
          {canManage && <th>Acciones</th>}
        </tr>
      </thead>
      <tbody>
        {products.map((product, index) => {
          const taxRate = product.taxRate ?? 0;
          const pvp = product.unitPrice;
          const base = taxRate > 0 ? pvp / (1 + taxRate / 100) : pvp;
          const iva = pvp - base;
          const total = pvp * product.quantity;
          return (
            <tr key={product.id}>
              <td>{index + 1}</td>
              <td style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#64748b" }}>{product.code}</td>
              <td>
                <div>{product.name}</div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{product.description}</div>
              </td>
              <td>{PRODUCT_CATEGORY_LABELS[product.category]}</td>
              <td>{taxRate > 0 ? `${taxRate}%` : "Exento"}</td>
              <td>${pvp.toFixed(2)}</td>
              <td>${base.toFixed(2)}</td>
              <td>${iva.toFixed(2)}</td>
              <td>{product.quantity}</td>
              <td>${total.toFixed(2)}</td>
              {canManage && (
                <td className="actions">
                  <button
                    type="button"
                    className="btn-edit"
                    onClick={() => onEdit(product)}
                  >
                    <Pencil size={16} />
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={() => onDelete(product.id)}
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default ProductTable;
