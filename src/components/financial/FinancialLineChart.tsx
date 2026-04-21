import { useState, useMemo } from "react";
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
import type { MonthlyData } from "../../hooks/useTransactions";

interface ChartDataItem {
  name: string;
  total: number;
}

/* Grafico de tendencia de ingresos mensuales */
interface Props {
  data: MonthlyData[];
}

const FinancialLineChart = ({ data }: Props) => {
  const [viewMode, setViewMode] = useState<"all" | "last12">("last12");

  const availableMonths = useMemo(() => {
    return data.map(d => d.monthKey).sort().reverse();
  }, [data]);

  const chartData = useMemo((): ChartDataItem[] => {
    if (data.length === 0) return [];
    
    if (viewMode === "last12") {
      const last12 = availableMonths.slice(0, 12).reverse();
      return data
        .filter(d => last12.includes(d.monthKey))
        .map(item => ({
          name: item.month.charAt(0).toUpperCase() + item.month.slice(1, 3),
          total: item.total,
        }));
    }
    
    return data.map(item => ({
      name: item.month.charAt(0).toUpperCase() + item.month.slice(1, 3),
      total: item.total,
    }));
  }, [viewMode, data, availableMonths]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  if (data.length === 0) {
    return (
      <div className="chart-empty">
        <p>No hay datos para mostrar</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="chart-controls">
        <h3 className="chart-title">Tendencia de Ingresos</h3>
        <div className="chart-selectors">
          <button
            className={`chart-view-btn ${viewMode === "last12" ? "chart-view-btn--active" : ""}`}
            onClick={() => setViewMode("last12")}
          >
            Últimos 12 meses
          </button>
          <button
            className={`chart-view-btn ${viewMode === "all" ? "chart-view-btn--active" : ""}`}
            onClick={() => setViewMode("all")}
          >
            Ver todos
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6b7280" />
          <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
            formatter={(value) => [formatCurrency(Number(value)), "Total"]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="total"
            name="Total"
            stroke="#8b5cf6"
            strokeWidth={3}
            dot={{ fill: "#8b5cf6", strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinancialLineChart;
