import { Trash2 } from "lucide-react";
import type { CartItem } from "../../types/pos.types";
import { round2, parseDecimal } from "../../utils/format/number";

/* Tabla del carrito de compras */
interface Props {
  items: CartItem[];
  onQtyChange: (key: string, quantity: number) => void;
  onDiscountChange: (key: string, discount: number) => void;
  onRemove: (key: string) => void;
}

const CartTable = ({ items, onQtyChange, onDiscountChange, onRemove }: Props) => {
  return (
    <table className="pos-cart-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Nombre</th>
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
            <td colSpan={8} className="pos-empty-row">
              No hay items en el carrito.
            </td>
          </tr>
        ) : (
          items.map((item, index) => {
            // IVA incluido: el subtotal (PVP * qty) ya incluye IVA
            const basePrice = item.taxRate > 0
              ? round2(item.subtotal / (1 + item.taxRate / 100))
              : item.subtotal;
            const itemTax = round2(item.subtotal - basePrice);
            const itemTotal = item.subtotal;
            const taxLabel = item.taxRate > 0
              ? `$${itemTax.toFixed(2)}`
              : `Exento`;
            return (
              <tr key={item.key}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
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
                        &#9650;
                      </button>
                      <button
                        type="button"
                        onClick={() => onQtyChange(item.key, Math.max(1, item.quantity - 1))}
                      >
                        &#9660;
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
                <td>{taxLabel}</td>
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
