import { Trash2 } from "lucide-react";
import type { CartItem } from "../../types/pos.types";
import { round2, parseDecimal } from "../../utils/format/number";

interface Props {
  items: CartItem[];
  taxRate: number;
  onQtyChange: (key: string, quantity: number) => void;
  onDiscountChange: (key: string, discount: number) => void;
  onRemove: (key: string) => void;
}

const CartTable = ({ items, taxRate, onQtyChange, onDiscountChange, onRemove }: Props) => {
  return (
    <table className="pos-cart-table">
      <thead>
        <tr>
          <th>Cod</th>
          <th>Nombre</th>
          <th>Descripcion</th>
          <th>Cantidad</th>
          <th>Precio</th>
          <th>Desc %</th>
          <th>IVA</th>
          <th>Total</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {items.length === 0 ? (
          <tr>
            <td colSpan={9} className="pos-empty-row">
              No hay items en el carrito.
            </td>
          </tr>
        ) : (
          items.map((item) => {
            const description = item.description || "--";
            const itemTax = round2(item.subtotal * taxRate);
            const itemTotal = round2(item.subtotal + itemTax);
            return (
              <tr key={item.key}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td className="pos-description">{description}</td>
                <td>
                  <div className="pos-qty-control">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        onQtyChange(item.key, Number(e.target.value))
                      }
                      className="pos-qty-input"
                    />
                    <div className="pos-qty-buttons">
                      <button
                        type="button"
                        onClick={() => onQtyChange(item.key, item.quantity + 1)}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => onQtyChange(item.key, Math.max(1, item.quantity - 1))}
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                </td>
                <td>${item.unitPrice.toFixed(2)}</td>
                <td>
                  <input
                    className="pos-discount-input"
                    type="text"
                    inputMode="decimal"
                    placeholder="%"
                    value={item.unitDiscount > 0 ? `${item.unitDiscount}%` : ""}
                    onChange={(e) =>
                      onDiscountChange(item.key, parseDecimal(e.target.value))
                    }
                  />
                </td>
                <td>${itemTax.toFixed(2)}</td>
                <td>${itemTotal.toFixed(2)}</td>
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
            );
          })
        )}
      </tbody>
    </table>
  );
};

export default CartTable;
