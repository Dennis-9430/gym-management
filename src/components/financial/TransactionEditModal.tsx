import { useState, useEffect } from "react";
import type { SaleRecord, PaymentMethod } from "../../types/sales.types";
import Modal from "../common/Modal";

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
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [cashAmount, setCashAmount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  useEffect(() => {
    if (transaction) {
      setMethod(transaction.payment.method);
      setCashAmount(transaction.payment.cashAmount.toString());
      setTransferAmount(transaction.payment.transferAmount.toString());
    }
  }, [transaction]);

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

  if (!transaction) return null;

  return (
    <div className="transaction-edit-modal">
      <Modal isOpen={isOpen} onClose={onClose} title="Editar Método de Pago" size="sm" centered>
        <form onSubmit={handleSubmit} className="transaction-edit-form">
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
                placeholder="0.00"
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
                placeholder="0.00"
              />
            </div>
          </>
        )}

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-save">
            Guardar
          </button>
        </div>
      </form>
      </Modal>
    </div>
  );
};

export default TransactionEditModal;
