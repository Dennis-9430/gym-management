import { formatCurrency } from "../../utils/format/currency";
import type { TransactionSummary } from "../../hooks/useTransactions";

interface EmployeeSummary {
  services: number;
  bar: number;
  cash: number;
  transfer: number;
  total: number;
}

/* Tabla de resumen financiero por empleado */
interface Props {
  summary: TransactionSummary;
  employeeData?: Record<string, EmployeeSummary>;
}

const FinancialSummaryTable = ({ summary, employeeData = {} }: Props) => {
  const employees = Object.keys(employeeData);
  
  const totalRow = employees.length > 0 ? Object.values(employeeData).reduce(
    (acc, curr) => ({
      services: acc.services + curr.services,
      bar: acc.bar + curr.bar,
      cash: acc.cash + curr.cash,
      transfer: acc.transfer + curr.transfer,
      total: acc.total + curr.total,
    }),
    { services: 0, bar: 0, cash: 0, transfer: 0, total: 0 }
  ) : null;

  return (
    <div className="summary-table-wrapper">
      <table className="summary-table">
        <thead>
          <tr>
            <th>Empleado</th>
            <th>Servicios</th>
            <th>Bar</th>
            <th>Efectivo</th>
            <th>Transferencia</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {employees.length > 0 ? (
            <>
              {employees.map((emp) => {
                const data = employeeData[emp];
                return (
                  <tr key={emp}>
                    <td className="employee-cell">{emp}</td>
                    <td className="services-cell">{formatCurrency(data.services)}</td>
                    <td className="bar-cell">{formatCurrency(data.bar)}</td>
                    <td className="cash-cell">{formatCurrency(data.cash)}</td>
                    <td className="transfer-cell">{formatCurrency(data.transfer)}</td>
                    <td className="total-cell">{formatCurrency(data.total)}</td>
                  </tr>
                );
              })}
              {totalRow && (
                <tr className="total-row">
                  <td className="employee-cell total-label">TOTAL</td>
                  <td className="services-cell">{formatCurrency(totalRow.services)}</td>
                  <td className="bar-cell">{formatCurrency(totalRow.bar)}</td>
                  <td className="cash-cell">{formatCurrency(totalRow.cash)}</td>
                  <td className="transfer-cell">{formatCurrency(totalRow.transfer)}</td>
                  <td className="total-cell">{formatCurrency(totalRow.total)}</td>
                </tr>
              )}
            </>
          ) : (
            <tr>
              <td className="employee-cell">-</td>
              <td className="services-cell">{formatCurrency(summary.services)}</td>
              <td className="bar-cell">{formatCurrency(summary.bar)}</td>
              <td className="cash-cell">{formatCurrency(summary.cash)}</td>
              <td className="transfer-cell">{formatCurrency(summary.transfer)}</td>
              <td className="total-cell">{formatCurrency(summary.total)}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FinancialSummaryTable;
