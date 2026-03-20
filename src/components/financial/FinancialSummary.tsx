import { DollarSign, Banknote, CreditCard, ShoppingBag } from "lucide-react";
import type { TransactionSummary } from "../../hooks/useTransactions";

interface Props {
  summary: TransactionSummary;
}

const FinancialSummary = ({ summary }: Props) => {
  return (
    <div className="financial-summary">
      <div className="financial-summary__card financial-summary__card--total">
        <div className="financial-summary__icon">
          <DollarSign size={24} />
        </div>
        <div className="financial-summary__content">
          <span className="financial-summary__value">
            ${summary.total.toFixed(2)}
          </span>
          <span className="financial-summary__label">Total Ventas</span>
        </div>
      </div>

      <div className="financial-summary__card">
        <div className="financial-summary__icon financial-summary__icon--cash">
          <Banknote size={22} />
        </div>
        <div className="financial-summary__content">
          <span className="financial-summary__value">
            ${summary.cash.toFixed(2)}
          </span>
          <span className="financial-summary__label">Efectivo</span>
        </div>
      </div>

      <div className="financial-summary__card">
        <div className="financial-summary__icon financial-summary__icon--transfer">
          <CreditCard size={22} />
        </div>
        <div className="financial-summary__content">
          <span className="financial-summary__value">
            ${summary.transfer.toFixed(2)}
          </span>
          <span className="financial-summary__label">Transferencia</span>
        </div>
      </div>

      <div className="financial-summary__card">
        <div className="financial-summary__icon financial-summary__icon--services">
          <ShoppingBag size={22} />
        </div>
        <div className="financial-summary__content">
          <span className="financial-summary__value">
            ${summary.services.toFixed(2)}
          </span>
          <span className="financial-summary__label">Servicios</span>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummary;
