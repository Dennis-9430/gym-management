import { useState } from "react";
import { useTransactions } from "../../hooks/useTransactions";
import type { SaleRecord } from "../../types/sales.types";
import FinancialTransactionsList from "../../components/financial/FinancialTransactionsList";
import TransactionEditModal from "../../components/financial/TransactionEditModal";
import FinancialDashboardButton from "../../components/financial/FinancialDashboardButton";
import "../../styles/financial.css";

const FinancialReport = () => {
  const {
    getTodayTransactions: todayTransactionsData,
    updateTransaction,
    formatItemsList,
    formatTime,
    getEmployeeName,
    formatMethodLabel,
    reload,
  } = useTransactions();

  const [editingTransaction, setEditingTransaction] = useState<SaleRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const todayTransactions = todayTransactionsData;

  const handleEdit = (transaction: SaleRecord) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (id: number, updates: Partial<SaleRecord>) => {
    updateTransaction(id, updates);
    reload();
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingTransaction(null);
  };

  return (
    <div className="financial-report">
      <div className="financial-report__header">
        <h2 className="financial-report__title">Reporte Financiero</h2>
        <p className="financial-report__subtitle">
          Transacciones del día - {new Date().toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="financial-report__actions">
        <FinancialDashboardButton />
      </div>

      <section className="financial-report__section">
        <FinancialTransactionsList
          transactions={todayTransactions}
          onEdit={handleEdit}
          formatItems={formatItemsList}
          formatTime={formatTime}
          getEmployeeName={getEmployeeName}
          formatMethodLabel={formatMethodLabel}
        />
      </section>

      <TransactionEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        transaction={editingTransaction}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default FinancialReport;
