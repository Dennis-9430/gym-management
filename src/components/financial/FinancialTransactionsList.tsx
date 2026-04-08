import { DollarSign, Wallet, CreditCard, Pencil } from "lucide-react";
import type { SaleRecord, PaymentMethod } from "../../types/sales.types";
import type { CartItem } from "../../types/pos.types";
import { formatCurrency } from "../../utils/format/currency";

interface Props {
  transactions: SaleRecord[];
  onEdit: (transaction: SaleRecord) => void;
  formatItems: (items: CartItem[]) => string;
  formatTime: (createdAt: string) => string;
  getEmployeeName: (createdBy?: string) => string;
  formatMethodLabel: (method: PaymentMethod) => string;
}

const FinancialTransactionsList = ({
  transactions,
  onEdit,
  formatItems,
  formatTime,
  getEmployeeName,
  formatMethodLabel,
}: Props) => {
  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case "CASH":
        return <Wallet size={16} className="method-icon cash" />;
      case "TRANSFER":
        return <CreditCard size={16} className="method-icon transfer" />;
      case "MIXED":
        return <CreditCard size={16} className="method-icon mixed" />;
      default:
        return null;
    }
  };

  const getMethodClass = (method: PaymentMethod) => {
    switch (method) {
      case "CASH":
        return "method-cash";
      case "TRANSFER":
        return "method-transfer";
      case "MIXED":
        return "method-mixed";
      default:
        return "";
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="transactions-empty">
        <p>No hay transacciones para mostrar</p>
      </div>
    );
  }

  return (
    <div className="transactions-list">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="transaction-item">
          <div className="transaction-time">{formatTime(transaction.createdAt)}</div>
          <div className="transaction-employee">{getEmployeeName(transaction.createdBy)}</div>
          <div className="transaction-items">{formatItems(transaction.items)}</div>
          <div className="transaction-amount">
            <DollarSign size={14} />
            {formatCurrency(transaction.totals.total)}
          </div>
          <div className={`transaction-method ${getMethodClass(transaction.payment.method)}`}>
            {getMethodIcon(transaction.payment.method)}
            <span>{formatMethodLabel(transaction.payment.method)}</span>
            <button
              type="button"
              className="btn-edit-transaction btn-edit-transaction--inline"
              onClick={() => onEdit(transaction)}
            >
              <Pencil size={14} />
            </button>
          </div>
          <div className="transaction-actions">
            <button
              type="button"
              className="btn-edit-transaction"
              onClick={() => onEdit(transaction)}
            >
              <Pencil size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FinancialTransactionsList;
