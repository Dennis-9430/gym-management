import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { MonthlyData } from "../../hooks/useTransactions";
import { useTransactions } from "../../hooks/useTransactions";

interface ChartDataItem {
  name: string;
  services: number;
  bar: number;
}

interface Props {
  data: MonthlyData[];
}

const FinancialBarChart = ({ data }: Props) => {
  const { transactions, groupByWeek } = useTransactions();
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [title, setTitle] = useState<string>("Ingresos Semanales (Últimos 6 Meses)");

  const availableMonths = useMemo(() => {
    return data.map(d => d.monthKey).sort().reverse();
  }, [data]);

  const chartData = useMemo((): ChartDataItem[] => {
    if (data.length === 0) return [];

    if (selectedMonth === "all") {
      const last6Months = availableMonths.slice(0, 6).reverse();
      const filteredData = data.filter(d => last6Months.includes(d.monthKey));
      
      const weeks: ChartDataItem[] = [];
      for (const monthData of filteredData) {
        const monthKey = monthData.monthKey;
        const weekData = groupByWeek(transactions, monthKey);
        for (const week of weekData) {
          weeks.push({
            name: week.week,
            services: week.services,
            bar: week.bar,
          });
        }
      }
      return weeks;
    }

    const weekData = groupByWeek(transactions, selectedMonth);
    return weekData.map(w => ({
      name: w.week,
      services: w.services,
      bar: w.bar,
    }));
  }, [selectedMonth, data, availableMonths, groupByWeek, transactions]);

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    if (month === "all") {
      setTitle("Ingresos Semanales (Últimos 6 Meses)");
    } else {
      const [year, monthNum] = month.split("-");
      const date = new Date(parseInt(year), parseInt(monthNum) - 1);
      setTitle(`Ingresos Semanales - ${date.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}`);
    }
  };

  const handleShowAll = () => {
    setSelectedMonth("all");
    setTitle("Ingresos Semanales (Últimos 6 Meses)");
  };

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
        <h3 className="chart-title">{title}</h3>
        <div className="chart-selectors">
          <select
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="month-select"
          >
            <option value="all">Todos los meses</option>
            {availableMonths.map((month) => {
              const [year, monthNum] = month.split("-");
              const date = new Date(parseInt(year), parseInt(monthNum) - 1);
              return (
                <option key={month} value={month}>
                  {date.toLocaleDateString("es-ES", { month: "short", year: "numeric" })}
                </option>
              );
            })}
          </select>
          <button
            className={`chart-view-btn ${selectedMonth === "all" ? "chart-view-btn--active" : ""}`}
            onClick={handleShowAll}
          >
            Últimos 6 meses
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={chartData} 
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }} 
            stroke="#6b7280" 
          />
          <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
            formatter={(value, name) => {
              const labels: Record<string, string> = {
                services: "Servicios",
                bar: "Bar",
              };
              return [formatCurrency(Number(value)), labels[String(name)] || name];
            }}
          />
          <Legend />
          <Bar dataKey="services" name="Servicios" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="bar" name="Bar" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinancialBarChart;
