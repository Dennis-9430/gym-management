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
                    <td className="employee-cell" data-label="Empleado">{emp}</td>
                    <td className="services-cell" data-label="Servicios">{formatCurrency(data.services)}</td>
                    <td className="bar-cell" data-label="Bar">{formatCurrency(data.bar)}</td>
                    <td className="cash-cell" data-label="Efectivo">{formatCurrency(data.cash)}</td>
                    <td className="transfer-cell" data-label="Transferencia">{formatCurrency(data.transfer)}</td>
                    <td className="total-cell" data-label="Total">{formatCurrency(data.total)}</td>
                  </tr>
                );
              })}
              {totalRow && (
                <tr className="total-row">
                  <td className="employee-cell total-label" data-label="Empleado">TOTAL</td>
                  <td className="services-cell" data-label="Servicios">{formatCurrency(totalRow.services)}</td>
                  <td className="bar-cell" data-label="Bar">{formatCurrency(totalRow.bar)}</td>
                  <td className="cash-cell" data-label="Efectivo">{formatCurrency(totalRow.cash)}</td>
                  <td className="transfer-cell" data-label="Transferencia">{formatCurrency(totalRow.transfer)}</td>
                  <td className="total-cell" data-label="Total">{formatCurrency(totalRow.total)}</td>
                </tr>
              )}
            </>
          ) : (
            <tr>
              <td className="employee-cell" data-label="Empleado">-</td>
              <td className="services-cell" data-label="Servicios">{formatCurrency(summary.services)}</td>
              <td className="bar-cell" data-label="Bar">{formatCurrency(summary.bar)}</td>
              <td className="cash-cell" data-label="Efectivo">{formatCurrency(summary.cash)}</td>
              <td className="transfer-cell" data-label="Transferencia">{formatCurrency(summary.transfer)}</td>
              <td className="total-cell" data-label="Total">{formatCurrency(summary.total)}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FinancialSummaryTable;
