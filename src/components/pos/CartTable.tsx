import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem } from "../../types/pos.types";

interface Props {
  items: CartItem[];
  onQtyChange: (key: string, quantity: number) => void;
  onDiscountChange: (key: string, discount: number) => void;
  onRemove: (key: string) => void;
}

const parseDecimal = (raw: string) => {
  const normalized = raw.replace(",", ".").replace(/[^0-9.]/g, "");
  const [whole, decimal] = normalized.split(".");
  const value = Number(decimal !== undefined ? `${whole}.${decimal}` : whole);
  return Number.isFinite(value) ? value : 0;
};

const CartTable = ({ items, onQtyChange, onDiscountChange, onRemove }: Props) => {
  return (
    <table className="pos-cart-table">
      <thead>
        <tr>
          <th>Codigo</th>
          <th>Producto</th>
          <th>Categoria</th>
          <th>Tipo</th>
          <th>Stock</th>
          <th>Cantidad</th>
          <th>Descuento item</th>
          <th>Precio</th>
          <th>Subtotal</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.key}>
            <td>{item.id}</td>
            <td>{item.name}</td>
            <td>{item.category}</td>
            <td className="pos-type">
              {item.source === "MEMBERSHIP" ? "Servicio" : "Producto"}
            </td>
            <td>{item.stock ?? "--"}</td>
            <td>
              <div className="pos-qty-control">
                <button
                  type="button"
                  onClick={() => onQtyChange(item.key, item.quantity - 1)}
                >
                  <Minus size={14} />
                </button>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    onQtyChange(item.key, Number(e.target.value))
                  }
                />
                <button
                  type="button"
                  onClick={() => onQtyChange(item.key, item.quantity + 1)}
                >
                  <Plus size={14} />
                </button>
              </div>
            </td>
            <td>
              <input
                className="pos-discount-input"
                type="text"
                inputMode="decimal"
                value={item.unitDiscount}
                onChange={(e) =>
                  onDiscountChange(item.key, parseDecimal(e.target.value))
                }
              />
            </td>
            <td>${item.unitPrice.toFixed(2)}</td>
            <td>${item.subtotal.toFixed(2)}</td>
            <td>
              <button
                className="pos-remove-btn"
                type="button"
                onClick={() => onRemove(item.key)}
              >
                <Trash2 size={16} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CartTable;
