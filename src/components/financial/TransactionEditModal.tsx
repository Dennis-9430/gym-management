import { useState, useMemo } from "react";
import type { SaleRecord, PaymentMethod } from "../../types/sales.types";
import { X } from "lucide-react";

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
  const initialValues = useMemo(() => {
    if (!transaction) {
      return { method: "CASH" as PaymentMethod, cashAmount: "", transferAmount: "" };
    }
    return {
      method: transaction.payment.method,
      cashAmount: transaction.payment.cashAmount.toString(),
      transferAmount: transaction.payment.transferAmount.toString(),
    };
  }, [transaction]);

  const [method, setMethod] = useState<PaymentMethod>(initialValues.method);
  const [cashAmount, setCashAmount] = useState(initialValues.cashAmount);
  const [transferAmount, setTransferAmount] = useState(initialValues.transferAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;

    const cash = parseFloat(cashAmount) || 0;
    const transfer = parseFloat(transferAmount) || 0;

    const updatedTransaction: Partial<SaleRecord> = {
      payment: {
        method,
        cashAmount: method === "CASH" ? transaction.totals.total : cash,
        transferAmount: method === "TRANSFER" ? transaction.totals.total : transfer,
      },
    };

    onSave(transaction.id, updatedTransaction);
    onClose();
  };

  if (!transaction || !isOpen) return null;

  return (
    <div className="edit-payment-backdrop" onClick={onClose}>
      <div className="edit-payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-payment-header">
          <h3>Editar Método de Pago</h3>
          <button type="button" className="edit-payment-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="edit-payment-form">
        <div className="edit-payment-field">
          <label>Método de Pago</label>
          <select
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
            <div className="edit-payment-field">
              <label>Efectivo</label>
              <input
                type="number"
                step="0.01"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="edit-payment-field">
              <label>Transferencia</label>
              <input
                type="number"
                step="0.01"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </>
        )}

        <div className="edit-payment-actions">
          <button type="button" className="edit-payment-btn edit-payment-btn--cancel" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="edit-payment-btn edit-payment-btn--save">
            Guardar
          </button>
        </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionEditModal;
