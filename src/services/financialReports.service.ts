/* Servicio para reportes financieros diarios */
import { getAuthToken } from "./api";

// Configuración de API - usa variable de entorno o fallback
const getApiBaseUrl = () => import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_BASE = `${getApiBaseUrl()}/api/reports`;

const getHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

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

const STORAGE_KEY = "gym-management.financial-reports";

const loadReports = (): FinancialReport[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as FinancialReport[];
  } catch {
    return [];
  }
};

const saveReports = (reports: FinancialReport[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
};

/* Obtiene resumen financiero desde MongoDB */
export const getFinancialSummary = async (
  startDate?: string,
  endDate?: string
): Promise<FinancialSummary | null> => {
  try {
    let url = `${API_BASE}/financial/summary`;
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, { headers: getHeaders() });
    if (!response.ok) {
      throw new Error("Error al obtener resumen financiero");
    }
    return await response.json();
  } catch (error) {
    return null;
  }
};

/* Obtiene reporte diario desde MongoDB */
export const getDailyReport = async (
  year: number,
  month: number
): Promise<DailyReport | null> => {
  try {
    const response = await fetch(`${API_BASE}/financial/daily?year=${year}&month=${month}`, { headers: getHeaders() });
    if (!response.ok) {
      throw new Error("Error al obtener reporte diario");
    }
    return await response.json();
  } catch (error) {
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
    const response = await fetch(`${API_BASE}/clients/summary`, { headers: getHeaders() });
    if (!response.ok) {
      throw new Error("Error al obtener resumen de clientes");
    }
    return await response.json();
  } catch (error) {
    return null;
  }
};

/* Obtiene resumen de asistencia desde MongoDB */
export const getAttendanceSummary = async (
  days: number = 7
): Promise<AttendanceSummary | null> => {
  try {
    const response = await fetch(`${API_BASE}/attendance/summary?days=${days}`, { headers: getHeaders() });
    if (!response.ok) {
      throw new Error("Error al obtener resumen de asistencia");
    }
    return await response.json();
  } catch (error) {
    return null;
  }
};

export const getFinancialSummaryAsync = async (
  startDate?: string,
  endDate?: string
): Promise<FinancialSummary | null> => {
  return getFinancialSummary(startDate, endDate);
};

/* Obtiene reportes financieros (fallback localStorage) */
export const getFinancialReports = async (): Promise<FinancialReport[]> => {
  const apiData = await getFinancialSummary();
  if (apiData) {
    return [];
  }
  return loadReports();
};

export const saveFinancialReport = (report: Omit<FinancialReport, "id">): FinancialReport => {
  const reports = loadReports();
  const newReport: FinancialReport = {
    ...report,
    id: reports.length ? Math.max(...reports.map((r) => r.id || 0)) + 1 : 1,
  };
  saveReports([...reports, newReport]);
  return newReport;
};

export const deleteFinancialReport = (id: number): void => {
  const reports = loadReports().filter((r) => r.id !== id);
  saveReports(reports);
};

export const getFinancialReportByDate = (date: string): FinancialReport | undefined => {
  return loadReports().find((r) => r.date === date);
};
