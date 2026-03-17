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

interface Props {
  data: MonthlyData[];
}

const FinancialBarChart = ({ data }: Props) => {
  if (data.length === 0) {
    return (
      <div className="chart-empty">
        <p>No hay datos para mostrar</p>
      </div>
    );
  }

  const capitalizedData = data.map((item) => ({
    ...item,
    month: item.month.charAt(0).toUpperCase() + item.month.slice(1),
  }));

  return (
    <div className="chart-container">
      <h3 className="chart-title">Ingresos Semanales</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={capitalizedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b7280" />
          <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
            formatter={(value) => [`$${Number(value).toFixed(2)}`, "Ingreso"]}
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
