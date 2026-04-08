import { useState, useMemo } from "react";
import { useTransactions } from "../../hooks/useTransactions";
import type { SaleRecord } from "../../types/sales.types";
import FinancialTransactionsList from "../../components/financial/FinancialTransactionsList";
import TransactionEditModal from "../../components/financial/TransactionEditModal";
import FinancialDashboardButton from "../../components/financial/FinancialDashboardButton";
import FinancialSummary from "../../components/financial/FinancialSummary";
import "../../styles/financial.css";

type DateFilter = "today" | "week" | "month" | "custom";

const FinancialReport = () => {
  const {
    transactions,
    updateTransaction,
    formatItemsList,
    formatTime,
    getEmployeeName,
    formatMethodLabel,
    calculateSummary,
    reload,
  } = useTransactions();

  const [editingTransaction, setEditingTransaction] = useState<SaleRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>(() => {
    const saved = localStorage.getItem("financial_dateFilter");
    return (saved as DateFilter) || "today";
  });
  const [customStartDate, setCustomStartDate] = useState(() => {
    return localStorage.getItem("financial_customStartDate") || "";
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    return localStorage.getItem("financial_customEndDate") || "";
  });

  const handleSetDateFilter = (filter: DateFilter) => {
    setDateFilter(filter);
    localStorage.setItem("financial_dateFilter", filter);
  };

  const handleSetCustomStartDate = (date: string) => {
    setCustomStartDate(date);
    localStorage.setItem("financial_customStartDate", date);
  };

  const handleSetCustomEndDate = (date: string) => {
    setCustomEndDate(date);
    localStorage.setItem("financial_customEndDate", date);
  };

  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (dateFilter) {
      case "today":
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        };
      case "week":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        return { start: weekStart, end: weekEnd };
      case "month":
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        return { start: monthStart, end: monthEnd };
      case "custom":
        if (customStartDate && customEndDate) {
          return {
            start: new Date(customStartDate),
            end: new Date(customEndDate + "T23:59:59"),
          };
        }
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        };
      default:
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        };
    }
  };

  const filteredTransactions = useMemo(() => {
    const { start, end } = getDateRange();
    return transactions
      .filter((t) => {
        const date = new Date(t.createdAt);
        return date >= start && date <= end;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [transactions, dateFilter, customStartDate, customEndDate]);

  const summary = useMemo(
    () => calculateSummary(filteredTransactions),
    [calculateSummary, filteredTransactions],
  );

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

  const formatDateLabel = () => {
    switch (dateFilter) {
      case "today":
        return new Date().toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      case "week":
        return "Esta semana";
      case "month":
        return new Date().toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
        });
      case "custom":
        return `${customStartDate} - ${customEndDate}`;
    }
  };

  return (
    <div className="financial-report">
      <div className="financial-report__header">
        <h2 className="financial-report__title">Reporte Financiero</h2>
        <p className="financial-report__subtitle">{formatDateLabel()}</p>
      </div>

      <div className="financial-report__actions">
        <FinancialDashboardButton />
      </div>

      <div className="financial-report__filters">
        <button
          className={`financial-report__filter-btn ${
            dateFilter === "today" ? "financial-report__filter-btn--active" : ""
          }`}
          onClick={() => handleSetDateFilter("today")}
        >
          Hoy
        </button>
        <button
          className={`financial-report__filter-btn ${
            dateFilter === "week" ? "financial-report__filter-btn--active" : ""
          }`}
          onClick={() => handleSetDateFilter("week")}
        >
          Esta Semana
        </button>
        <button
          className={`financial-report__filter-btn ${
            dateFilter === "month" ? "financial-report__filter-btn--active" : ""
          }`}
          onClick={() => handleSetDateFilter("month")}
        >
          Este Mes
        </button>
        <button
          className={`financial-report__filter-btn ${
            dateFilter === "custom" ? "financial-report__filter-btn--active" : ""
          }`}
          onClick={() => handleSetDateFilter("custom")}
        >
          Personalizado
        </button>
        {dateFilter === "custom" && (
          <>
            <input
              type="date"
              className="date-input"
              value={customStartDate}
              onChange={(e) => handleSetCustomStartDate(e.target.value)}
            />
            <input
              type="date"
              className="date-input"
              value={customEndDate}
              onChange={(e) => handleSetCustomEndDate(e.target.value)}
            />
          </>
        )}
      </div>

      <FinancialSummary summary={summary} />

      <section className="financial-report__section">
        <div className="transactions-header">
          <h3 className="section-title">
            Transacciones ({filteredTransactions.length})
          </h3>
        </div>
        <FinancialTransactionsList
          transactions={filteredTransactions}
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
