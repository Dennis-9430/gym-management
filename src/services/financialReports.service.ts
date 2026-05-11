/* Servicio para reportes financieros diarios */
import { apiGet } from "./api";

export interface FinancialReport {
  id?: number;
  date: string;
  totalIncome: number;
  servicesIncome: number;
  barIncome: number;
  employeeIncomes: Record<string, number>;
  transfersByEmployee: { name: string; count: number }[];
}

export interface FinancialSummary {
  period: { start: string | null; end: string | null };
  summary: {
    totalSales: number;
    totalRevenue: number;
    cashRevenue: number;
    cardRevenue: number;
    transferRevenue: number;
  };
}

export interface DailyReport {
  year: number;
  month: number;
  data: { date: string; sales: number; revenue: number }[];
}

export interface AttendanceSummary {
  period: string;
  total: number;
  daily: { date: string; count: number }[];
}

/* Obtiene resumen financiero desde MongoDB */
export const getFinancialSummary = async (
  startDate?: string,
  endDate?: string
): Promise<FinancialSummary | null> => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const query = params.toString() ? `?${params.toString()}` : "";
    return await apiGet(`/api/reports/financial/summary${query}`);
  } catch {
    return null;
  }
};

/* Obtiene reporte diario desde MongoDB */
export const getDailyReport = async (
  year: number,
  month: number
): Promise<DailyReport | null> => {
  try {
    return await apiGet(`/api/reports/financial/daily?year=${year}&month=${month}`);
  } catch {
    return null;
  }
};

/* Obtiene resumen de clientes desde MongoDB */
export const getClientsSummary = async (): Promise<{
  total: number;
  active: number;
  expired: number;
  none: number;
} | null> => {
  try {
    return await apiGet("/api/reports/clients/summary");
  } catch {
    return null;
  }
};

/* Obtiene resumen de asistencia desde MongoDB */
export const getAttendanceSummary = async (
  days: number = 7
): Promise<AttendanceSummary | null> => {
  try {
    return await apiGet(`/api/reports/attendance/summary?days=${days}`);
  } catch {
    return null;
  }
};

export const getFinancialSummaryAsync = async (
  startDate?: string,
  endDate?: string
): Promise<FinancialSummary | null> => {
  return getFinancialSummary(startDate, endDate);
};
