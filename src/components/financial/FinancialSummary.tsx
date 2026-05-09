import { DollarSign, Banknote, CreditCard } from "lucide-react";
import type { TransactionSummary } from "../../hooks/useTransactions";

/* Resumen financiero con totales por método de pago */
interface Props {
  summary: TransactionSummary;
}

const FinancialSummary = ({ summary }: Props) => {
  return (
    <div className="financial-summary">
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

      {summary.iva !== undefined && (
        <div className="financial-summary__card">
          <div className="financial-summary__icon financial-summary__icon--transfer">
            <DollarSign size={22} />
          </div>
          <div className="financial-summary__content">
            <span className="financial-summary__value">
              ${summary.iva.toFixed(2)}
            </span>
            <span className="financial-summary__label">IVA Generado</span>
          </div>
        </div>
      )}

      {summary.taxableBase !== undefined && (
        <div className="financial-summary__card">
          <div className="financial-summary__icon financial-summary__icon--cash">
            <DollarSign size={22} />
          </div>
          <div className="financial-summary__content">
            <span className="financial-summary__value">
              ${summary.taxableBase.toFixed(2)}
            </span>
            <span className="financial-summary__label">Base Imponible</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialSummary;
