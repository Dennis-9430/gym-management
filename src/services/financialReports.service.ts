/* Servicio para reportes financieros diarios */
export interface FinancialReport {
  id?: number;
  date: string;
  totalIncome: number;
  servicesIncome: number;
  barIncome: number;
  employeeIncomes: Record<string, number>;
  transfersByEmployee: { name: string; count: number }[];
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

export const getFinancialReports = (): FinancialReport[] => {
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
