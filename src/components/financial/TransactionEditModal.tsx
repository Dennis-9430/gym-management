import { useState, useEffect } from "react";
import type { SaleRecord, PaymentMethod } from "../../types/sales.types";
import type { CartItem } from "../../types/pos.types";
import Modal from "../common/Modal";
import { formatCurrency } from "../../utils/format/currency";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transaction: SaleRecord | null;
  onSave: (id: number, updates: Partial<SaleRecord>) => void;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Efectivo" },
  { value: "TRANSFER", label: "Transferencia" },
  { value: "MIXED", label: "Mixto" },
];

const TransactionEditModal = ({ isOpen, onClose, transaction, onSave }: Props) => {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [cashAmount, setCashAmount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.totals.total.toString());
      setMethod(transaction.payment.method);
      setCashAmount(transaction.payment.cashAmount.toString());
      setTransferAmount(transaction.payment.transferAmount.toString());
      setItems(transaction.items);
    }
  }, [transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;

    const totalAmount = parseFloat(amount) || 0;
    const cash = parseFloat(cashAmount) || 0;
    const transfer = parseFloat(transferAmount) || 0;

    const updatedItems = items.map((item) => ({
      ...item,
      subtotal: item.unitPrice * item.quantity,
    }));

    const updatedTransaction: Partial<SaleRecord> = {
      totals: {
        ...transaction.totals,
        subtotal: totalAmount,
        discountAmount: 0,
        discountRate: 0,
        taxableSubtotal: totalAmount,
        vatSubtotal: 0,
        taxRate: 0,
        taxAmount: 0,
        iceAmount: 0,
        total: totalAmount,
      },
      payment: {
        method,
        cashAmount: method === "CASH" ? totalAmount : cash,
        transferAmount: method === "TRANSFER" ? totalAmount : transfer,
      },
      items: updatedItems,
    };

    onSave(transaction.id, updatedTransaction);
    onClose();
  };

  const handleItemNameChange = (index: number, newName: string) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], name: newName };
    setItems(updatedItems);
  };

  if (!transaction) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Transacción" size="md">
      <form onSubmit={handleSubmit} className="transaction-edit-form">
        <div className="form-group">
          <label htmlFor="amount">Monto Total</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="method">Método de Pago</label>
          <select
            id="method"
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
          >
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm.value} value={pm.value}>
                {pm.label}
              </option>
            ))}
          </select>
        </div>

        {method === "MIXED" && (
          <>
            <div className="form-group">
              <label htmlFor="cashAmount">Monto en Efectivo</label>
              <input
                id="cashAmount"
                type="number"
                step="0.01"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="transferAmount">Monto en Transferencia</label>
              <input
                id="transferAmount"
                type="number"
                step="0.01"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                required
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label>Productos/Servicios</label>
          <div className="items-edit-list">
            {items.map((item, index) => (
              <div key={index} className="item-edit-row">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleItemNameChange(index, e.target.value)}
                  placeholder="Nombre del producto"
                />
                <span className="item-price">{formatCurrency(item.unitPrice)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-save">
            Guardar Cambios
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionEditModal;
