import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTransactions } from "../../hooks/useTransactions";
import FinancialSummaryTable from "../../components/financial/FinancialSummaryTable";
import { ArrowLeft, Calendar, Users } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "../../styles/financial.css";

interface DailyData {
  date: string;
  services: number;
  bar: number;
  total: number;
}

interface ClientData {
  clientName: string;
  visits: number;
  total: number;
}

const FinancialMonthlyReport = () => {
  const navigate = useNavigate();
  const { transactions } = useTransactions();

  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [showClientsChart, setShowClientsChart] = useState(false);

  const months = useMemo(() => {
    const monthSet = new Set<string>();
    for (const txn of transactions) {
      const monthKey = txn.createdAt.slice(0, 7);
      monthSet.add(monthKey);
    }
    return Array.from(monthSet).sort().reverse();
  }, [transactions]);

  const monthTransactions = useMemo(() => {
    return transactions.filter((txn) => txn.createdAt.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const summaryByEmployee = useMemo(() => {
    const summaries: Record<string, { services: number; bar: number; cash: number; transfer: number; total: number }> = {};
    
    for (const txn of monthTransactions) {
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
  }, [monthTransactions]);

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

  const dailyData = useMemo(() => {
    const daily: Record<string, DailyData> = {};
    
    for (const txn of monthTransactions) {
      const day = txn.createdAt.split("T")[0];
      if (!daily[day]) {
        daily[day] = { date: day, services: 0, bar: 0, total: 0 };
      }
      
      for (const item of txn.items) {
        const isService = ["mensual", "quincenal", "semanal", "diario", "promo"].some(k => 
          item.name.toLowerCase().includes(k)
        );
        if (isService) {
          daily[day].services += item.subtotal;
        } else {
          daily[day].bar += item.subtotal;
        }
      }
      daily[day].total += txn.totals.total;
    }
    
    return Object.values(daily).sort((a, b) => a.date.localeCompare(b.date));
  }, [monthTransactions]);

  const clientData = useMemo(() => {
    const clients: Record<string, ClientData> = {};
    
    for (const txn of monthTransactions) {
      const clientName = txn.client.firstName && txn.client.lastName
        ? `${txn.client.firstName} ${txn.client.lastName}`
        : txn.client.documentNumber || "Cliente";
      
      if (!clients[clientName]) {
        clients[clientName] = { clientName, visits: 0, total: 0 };
      }
      clients[clientName].visits += 1;
      clients[clientName].total += txn.totals.total;
    }
    
    return Object.values(clients).sort((a, b) => b.total - a.total);
  }, [monthTransactions]);

  const formatMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  };

  const formatDayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", { day: "numeric" });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  return (
    <div className="financial-dashboard">
      <div className="financial-dashboard__header">
        <button className="btn-back" onClick={() => navigate("/financial/dashboard")}>
          <ArrowLeft size={22} />
          Atrás
        </button>
        <h2 className="financial-dashboard__title">Reporte Mensual</h2>
      </div>

      <div className="date-selector">
        <span className="date-selector-label">Buscar Reporte</span>
        <Calendar size={18} />
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="month-select"
        >
          {months.map((month) => (
            <option key={month} value={month}>
              {formatMonthLabel(month)}
            </option>
          ))}
        </select>
      </div>

      <section className="financial-dashboard__section">
        <h3 className="section-title">Resumen del Mes</h3>
        <FinancialSummaryTable 
          summary={{
            services: totalSummary.services,
            bar: totalSummary.bar,
            cash: totalSummary.cash,
            transfer: totalSummary.transfer,
            total: totalSummary.total,
          }} 
          employeeData={summaryByEmployee} 
        />
      </section>

      <section className="financial-dashboard__section">
        <h3 className="section-title">Evolución de Ingresos</h3>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11 }} 
                stroke="#6b7280"
                tickFormatter={formatDayLabel}
              />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value) => [formatCurrency(Number(value)), "Ingreso"]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                name="Total"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: "#8b5cf6", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="services"
                name="Servicios"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6" }}
              />
              <Line
                type="monotone"
                dataKey="bar"
                name="Bar"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="financial-dashboard__section">
        <button 
          className="btn-toggle-clients"
          onClick={() => setShowClientsChart(!showClientsChart)}
        >
          <Users size={18} />
          {showClientsChart ? "Ocultar" : "Ver"} Evolución de Clientes
        </button>

        {showClientsChart && (
          <div className="clients-chart-section">
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={clientData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="clientName" 
                    tick={{ fontSize: 10 }} 
                    stroke="#6b7280"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    formatter={(value, name) => [
                      name === "total" ? formatCurrency(Number(value)) : value,
                      name === "total" ? "Total" : "Visitas",
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Ingreso"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ fill: "#f59e0b", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default FinancialMonthlyReport;
