import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTransactions } from "../../hooks/useTransactions";
import { useEmployees } from "../../hooks/useEmployees";
import FinancialBarChart from "../../components/financial/FinancialBarChart";
import FinancialSummaryTable from "../../components/financial/FinancialSummaryTable";
import { ArrowLeft, TrendingUp } from "lucide-react";
import {
  getFinancialSummary,
} from "../../services/financialReports.service";
import { usePlanAccess } from "../../hooks/usePlanAccess";
import Modal from "../../components/common/Modal";
import "../../styles/financial.css";

/* Dashboard financiero con resumen diario y graficos */
const FinancialDashboard = () => {
  const navigate = useNavigate();
  const { isPremium } = usePlanAccess();
  const { transactions, groupByMonth, getTransactionsByDate, isServiceItem, calcItemIVA } =
    useTransactions();
  const { employees, refresh: refreshEmployees } = useEmployees();

  useEffect(() => {
    if (!isPremium()) {
      alert("Las estadísticas están disponibles en el plan PRO. ¡Upgrade tu plan para acceder!");
      navigate("/financial");
      return;
    }
  }, [isPremium, navigate]);

  useEffect(() => {
    refreshEmployees();
  }, [refreshEmployees]);

  // Mapa username/email → nombre completo
  const employeeNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const emp of employees) {
      const fullName = [emp.firstName, emp.lastName].filter(Boolean).join(" ");
      if (fullName) {
        map[emp.username] = fullName;
        if (emp.email) map[emp.email] = fullName;
      }
    }
    return map;
  }, [employees]);

  const getDisplayName = useCallback((name?: string): string => {
    if (!name) return "Sistema";
    return employeeNameMap[name] || name;
  }, [employeeNameMap]);

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<{code: string; image?: string}>({ code: "" });

  const handleVoucherClick = (voucherCode: string, voucherImage?: string) => {
    setSelectedVoucher({ code: voucherCode, image: voucherImage });
    setShowVoucherModal(true);
  };

  const monthlyData = useMemo(
    () => groupByMonth(transactions),
    [groupByMonth, transactions],
  );

  const todayTransactions = useMemo(
    () => getTransactionsByDate(selectedDate),
    [getTransactionsByDate, selectedDate],
  );

  // Mock data para transferencias cuando no hay datos reales
  const mockTransfers = todayTransactions.length === 0 ? [
    {
      employee: "Juan Pérez",
      voucherCode: "TRF-001",
      voucherImage: undefined
    },
    {
      employee: "María González",
      voucherCode: "DEP-2024-001",
      voucherImage: undefined
    }
  ] : [];

  const summaryByEmployee = useMemo(() => {
    const summaries: Record<
      string,
      {
        services: number;
        bar: number;
        cash: number;
        transfer: number;
        total: number;
      }
    > = {};

    for (const txn of todayTransactions) {
      const employee = getDisplayName(txn.createdBy);
      if (!summaries[employee]) {
        summaries[employee] = {
          services: 0,
          bar: 0,
          cash: 0,
          transfer: 0,
          total: 0,
        };
      }

      for (const item of txn.items) {
        if (isServiceItem(item)) {
          summaries[employee].services += item.subtotal;
        } else {
          summaries[employee].bar += item.subtotal;
        }
      }

      if (txn.payment.method === "CASH" || txn.payment.method === "MIXED") {
        summaries[employee].cash += txn.payment.cashAmount;
      }
      if (txn.payment.method === "TRANSFER" || txn.payment.method === "MIXED") {
        summaries[employee].transfer += txn.payment.transferAmount;
      }
      summaries[employee].total += txn.totals.total;
    }

    return summaries;
  }, [todayTransactions]);

  const transfersWithVouchers = useMemo(() => {
    return todayTransactions
      .filter(
        (txn) =>
          txn.payment.method === "TRANSFER" || txn.payment.method === "MIXED",
      )
      .map((txn) => ({
        employee: getDisplayName(txn.createdBy),
        voucherCode: txn.voucherCode || "N/A",
        voucherImage: txn.voucherImage,
      }));
  }, [todayTransactions]);

  const displayTransfers = transfersWithVouchers.length > 0 ? transfersWithVouchers : mockTransfers;

  const totalSummary = useMemo(() => {
    return Object.values(summaryByEmployee).reduce(
      (acc, curr) => ({
        services: acc.services + curr.services,
        bar: acc.bar + curr.bar,
        cash: acc.cash + curr.cash,
        transfer: acc.transfer + curr.transfer,
        total: acc.total + curr.total,
      }),
      { services: 0, bar: 0, cash: 0, transfer: 0, total: 0 },
    );
    // taxableBase e iva se calculan en el FinancialReport, no por empleado
  }, [summaryByEmployee]);



  useEffect(() => {
    getFinancialSummary(selectedDate, selectedDate).then(() => {}).catch(() => {});
  }, [selectedDate]);

  return (
    <div className="financial-dashboard">
      <div className="financial-dashboard__header">
        <button 
          className="btn-back" 
          onClick={() => navigate("/financial")}
          style={{ 
            background: 'var(--color-primary)', 
            color: '#fff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={18} />
          <span>Volver</span>
        </button>
        <h2 className="financial-dashboard__title">Estadísticas Detalladas</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginTop: '-4px' }}>
          Resumen diario de ventas por empleado y método de pago
        </p>
      </div>

      <div className="date-selector">
        <span className="date-selector-label">Buscar Reporte</span>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-input"
        />
      </div>

      <section className="financial-dashboard__section">
        <h3 className="section-title">Resumen del Día</h3>
        <FinancialSummaryTable
          summary={totalSummary}
          employeeData={summaryByEmployee}
        />
      </section>

      <section className="financial-dashboard__section">
        <h3 className="section-title">Transferencias</h3>
        <div
          className={`transfers-table-wrapper ${displayTransfers.length > 5 ? "transfers-table-wrapper--scroll" : ""}`}
        >
          <table className="transfers-table">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Comprobante</th>
              </tr>
            </thead>
            <tbody>
              {displayTransfers.length === 0 ? (
                <tr>
                  <td colSpan={2} className="no-data">
                    No hay transferencias
                  </td>
                </tr>
              ) : (
                displayTransfers.map((item, index) => (
                  <tr key={index}>
                    <td>{item.employee}</td>
                    <td>
                      <button
                        className="voucher-link"
                        onClick={() => handleVoucherClick(item.voucherCode, item.voucherImage)}
                      >
                        {item.voucherCode}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <button
        className="btn-monthly-report"
        onClick={() => navigate("/financial/monthly")}
      >
        <TrendingUp size={18} />
        Ver Reporte Mensual
      </button>

      <div className="financial-dashboard__charts">
        <div className="chart-wrapper">
          <FinancialBarChart data={monthlyData} />
        </div>
      </div>

      <Modal
        isOpen={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        title={`Comprobante: ${selectedVoucher.code}`}
        size="sm"
        centered
      >
        <div className="voucher-modal-content" style={{ padding: '16px' }}>
          {selectedVoucher.image ? (
            <div style={{ textAlign: 'center' }}>
              <img 
                src={selectedVoucher.image} 
                alt="Comprobante" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '250px', 
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }} 
              />
            </div>
          ) : (
            <div className="voucher-placeholder" style={{ padding: '20px' }}>
              <p style={{ fontWeight: 500, color: '#334155', marginBottom: '8px' }}>Código de referencia:</p>
              <p className="voucher-code-display" style={{ 
                fontSize: '16px', 
                fontWeight: 600, 
                color: '#4f46e5',
                background: '#f1f5f9',
                padding: '10px',
                borderRadius: '6px',
                textAlign: 'center',
                marginBottom: '12px'
              }}>
                {selectedVoucher.code}
              </p>
              <p className="voucher-hint" style={{ fontSize: '11px', color: '#94a3b8' }}>
                (No hay imagen de comprobante disponible)
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default FinancialDashboard;
