import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTransactions } from "../../hooks/useTransactions";
import FinancialBarChart from "../../components/financial/FinancialBarChart";
import FinancialLineChart from "../../components/financial/FinancialLineChart";
import FinancialSummaryTable from "../../components/financial/FinancialSummaryTable";
import { ArrowLeft, Calendar, TrendingUp } from "lucide-react";
import { saveFinancialReport, getFinancialReports } from "../../services/financialReports.service";
import Modal from "../../components/common/Modal";
import "../../styles/financial.css";

const FinancialDashboard = () => {
  const navigate = useNavigate();
  const { transactions, groupByMonth, getTransactionsByDate } = useTransactions();

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<string>("");

  const monthlyData = useMemo(() => groupByMonth(transactions), [groupByMonth, transactions]);

  const todayTransactions = useMemo(() => getTransactionsByDate(selectedDate), [getTransactionsByDate, selectedDate]);

  const summaryByEmployee = useMemo(() => {
    const summaries: Record<string, { services: number; bar: number; cash: number; transfer: number; total: number }> = {};
    
    for (const txn of todayTransactions) {
      const employee = txn.createdBy || "Sistema";
      if (!summaries[employee]) {
        summaries[employee] = { services: 0, bar: 0, cash: 0, transfer: 0, total: 0 };
      }
      
      for (const item of txn.items) {
        const isService = ["mensual", "quincenal", "semanal", "diario", "promo"].some(k => 
          item.name.toLowerCase().includes(k)
        );
        if (isService) {
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
    return todayTransactions.filter(
      (txn) => txn.payment.method === "TRANSFER" || txn.payment.method === "MIXED"
    ).map((txn) => ({
      employee: txn.createdBy || "Sistema",
      voucherCode: txn.voucherCode || "N/A",
    }));
  }, [todayTransactions]);

  const totalSummary = useMemo(() => {
    return Object.values(summaryByEmployee).reduce(
      (acc, curr) => ({
        services: acc.services + curr.services,
        bar: acc.bar + curr.bar,
        cash: acc.cash + curr.cash,
        transfer: acc.transfer + curr.transfer,
        total: acc.total + curr.total,
      }),
      { services: 0, bar: 0, cash: 0, transfer: 0, total: 0 }
    );
  }, [summaryByEmployee]);

  useEffect(() => {
    const existingReport = getFinancialReports().find((r) => r.date === selectedDate);
    if (!existingReport && transfersWithVouchers.length > 0) {
      saveFinancialReport({
        date: selectedDate,
        totalIncome: totalSummary.total,
        servicesIncome: totalSummary.services,
        barIncome: totalSummary.bar,
        employeeIncomes: Object.fromEntries(
          Object.entries(summaryByEmployee).map(([emp, data]) => [emp, data.total])
        ),
        transfersByEmployee: transfersWithVouchers.map((t) => ({
          name: t.employee,
          count: 1,
          voucherCode: t.voucherCode,
        })),
      });
    }
  }, [selectedDate, transfersWithVouchers, totalSummary, summaryByEmployee]);

  const handleVoucherClick = (voucherCode: string) => {
    setSelectedVoucher(voucherCode);
    setShowVoucherModal(true);
  };

  return (
    <div className="financial-dashboard">
      <div className="financial-dashboard__header">
        <button className="btn-back" onClick={() => navigate("/financial")}>
          <ArrowLeft size={22} />
          Atrás
        </button>
        <h2 className="financial-dashboard__title">Estadísticas</h2>
      </div>

      <div className="date-selector">
        <span className="date-selector-label">Buscar Reporte</span>
        <Calendar size={18} />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-input"
        />
      </div>

      <section className="financial-dashboard__section">
        <h3 className="section-title">Resumen del Día</h3>
        <FinancialSummaryTable summary={totalSummary} employeeData={summaryByEmployee} />
      </section>

      <section className="financial-dashboard__section">
        <h3 className="section-title">Transferencias</h3>
        <div className="transfers-table-wrapper">
          <table className="transfers-table">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Comprobante</th>
              </tr>
            </thead>
            <tbody>
              {transfersWithVouchers.length === 0 ? (
                <tr>
                  <td colSpan={2} className="no-data">No hay transferencias</td>
                </tr>
              ) : (
                transfersWithVouchers.map((item, index) => (
                  <tr key={index}>
                    <td>{item.employee}</td>
                    <td>
                      <button
                        className="voucher-link"
                        onClick={() => handleVoucherClick(item.voucherCode)}
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

      <button className="btn-monthly-report" onClick={() => navigate("/financial/monthly")}>
        <TrendingUp size={18} />
        Ver Reporte Mensual
      </button>

      <div className="financial-dashboard__charts">
        <div className="chart-wrapper">
          <FinancialBarChart data={monthlyData} />
        </div>
        <div className="chart-wrapper">
          <FinancialLineChart data={monthlyData} />
        </div>
      </div>

      <Modal
        isOpen={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        title={`Comprobante: ${selectedVoucher}`}
        size="lg"
      >
        <div className="voucher-modal-content">
          <div className="voucher-placeholder">
            <p>Imagen del comprobante</p>
            <p className="voucher-code-display">{selectedVoucher}</p>
            <p className="voucher-hint">(Demo: aquí se mostraría la imagen cargada)</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FinancialDashboard;
