import { useMemo, useState, useCallback } from "react";
import type { SaleRecord, SaleInput, PaymentMethod } from "../types/sales.types";
import type { CartItem } from "../types/pos.types";
import { getSales, updateSale, createSale } from "../services/sales.service";

/* Resumen de transacciones por método de pago */
export interface TransactionSummary {
  services: number;
  bar: number;
  cash: number;
  transfer: number;
  total: number;
}

/* Datos mensuales para gráficos */
export interface MonthlyData {
  month: string;
  monthKey: string;
  services: number;
  bar: number;
  total: number;
}

/* Datos semanales para gráficos */
export interface WeeklyData {
  week: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  services: number;
  bar: number;
  total: number;
}

/* Datos anuales */
export interface YearlyData {
  month: string;
  monthKey: string;
  total: number;
}

const SERVICE_KEYWORDS = ["mensual", "quincenal", "semanal", "diario", "promo"];

const isServiceItem = (item: CartItem): boolean => {
  const name = item.name.toLowerCase();
  const category = item.category?.toLowerCase() || "";
  return SERVICE_KEYWORDS.some(k => name.includes(k) || category.includes("servicio"));
};

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<SaleRecord[]>(() => getSales());

  const reload = useCallback(() => {
    setTransactions(getSales());
  }, []);

  const getTodayTransactions = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return transactions
      .filter(t => t.createdAt.startsWith(today))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [transactions]);

  const getTransactionsByDate = useCallback((date: string) => {
    return transactions
      .filter(t => t.createdAt.startsWith(date))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [transactions]);

  const formatItemsList = useCallback((items: CartItem[]): string => {
    if (!items || items.length === 0) return "-";
    return items.map(item => item.name).join(" + ");
  }, []);

  const calculateSummary = useCallback((txns: SaleRecord[]): TransactionSummary => {
    let services = 0;
    let bar = 0;
    let cash = 0;
    let transfer = 0;

    for (const txn of txns) {
      for (const item of txn.items) {
        if (isServiceItem(item)) {
          services += item.subtotal;
        } else {
          bar += item.subtotal;
        }
      }

      if (txn.payment.method === "CASH" || txn.payment.method === "MIXED") {
        cash += txn.payment.cashAmount;
      }
      if (txn.payment.method === "TRANSFER" || txn.payment.method === "MIXED") {
        transfer += txn.payment.transferAmount;
      }
    }

    return {
      services,
      bar,
      cash,
      transfer,
      total: services + bar,
    };
  }, []);

  const groupByMonth = useCallback((txns: SaleRecord[]): MonthlyData[] => {
    const grouped: Record<string, MonthlyData> = {};

    for (const txn of txns) {
      const date = new Date(txn.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const month = date.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

      if (!grouped[monthKey]) {
        grouped[monthKey] = { month, monthKey, services: 0, bar: 0, total: 0 };
      }

      for (const item of txn.items) {
        if (isServiceItem(item)) {
          grouped[monthKey].services += item.subtotal;
        } else {
          grouped[monthKey].bar += item.subtotal;
        }
        grouped[monthKey].total += item.subtotal;
      }
    }

    return Object.values(grouped).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  }, []);

  const groupByWeek = useCallback((txns: SaleRecord[], monthKey: string): WeeklyData[] => {
    const filtered = txns.filter(t => t.createdAt.startsWith(monthKey));
    const weeks: Record<number, WeeklyData> = {};

    const getWeekNumber = (date: Date): number => {
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const dayOfMonth = date.getDate();
      return Math.ceil((dayOfMonth + firstDay.getDay()) / 7);
    };

    const getWeekRange = (weekNum: number, month: Date): { start: Date; end: Date } => {
      const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
      const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      const startDay = (weekNum - 1) * 7 + 1 - firstDay.getDay();
      const start = new Date(month.getFullYear(), month.getMonth(), Math.max(1, startDay));
      const end = new Date(month.getFullYear(), month.getMonth(), Math.min(lastDay.getDate(), startDay + 6));
      
      return { start, end };
    };

    const monthDate = new Date(monthKey + "-01");

    for (const txn of filtered) {
      const date = new Date(txn.createdAt);
      const weekNum = getWeekNumber(date);
      const range = getWeekRange(weekNum, monthDate);

      if (!weeks[weekNum]) {
        weeks[weekNum] = {
          week: `Semana ${weekNum}`,
          weekNumber: weekNum,
          startDate: range.start.toISOString().split("T")[0],
          endDate: range.end.toISOString().split("T")[0],
          services: 0,
          bar: 0,
          total: 0,
        };
      }

      for (const item of txn.items) {
        if (isServiceItem(item)) {
          weeks[weekNum].services += item.subtotal;
        } else {
          weeks[weekNum].bar += item.subtotal;
        }
        weeks[weekNum].total += item.subtotal;
      }
    }

    return Object.values(weeks).sort((a, b) => a.weekNumber - b.weekNumber);
  }, []);

  const groupByYear = useCallback((txns: SaleRecord[], year: number): YearlyData[] => {
    const filtered = txns.filter(t => t.createdAt.startsWith(String(year)));
    const months: Record<string, YearlyData> = {};

    for (let i = 0; i < 12; i++) {
      const monthKey = `${year}-${String(i + 1).padStart(2, "0")}`;
      const date = new Date(year, i);
      months[monthKey] = {
        month: date.toLocaleDateString("es-ES", { month: "long" }),
        monthKey,
        total: 0,
      };
    }

    for (const txn of filtered) {
      const monthKey = txn.createdAt.slice(0, 7);
      if (months[monthKey]) {
        for (const item of txn.items) {
          months[monthKey].total += item.subtotal;
        }
      }
    }

    return Object.values(months);
  }, []);

  const updateTransaction = useCallback((id: number, update: Partial<SaleRecord>) => {
    updateSale(id, update as SaleRecord);
    reload();
  }, [reload]);

  const addTransaction = useCallback((input: SaleInput) => {
    createSale(input);
    reload();
  }, [reload]);

  const todaySummary = useMemo(() => calculateSummary(getTodayTransactions), [calculateSummary, getTodayTransactions]);

  const getEmployeeName = useCallback((createdBy?: string): string => {
    return createdBy || "Sistema";
  }, []);

  const formatTime = useCallback((createdAt: string): string => {
    const date = new Date(createdAt);
    return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  }, []);

  const formatMethodLabel = useCallback((method: PaymentMethod): string => {
    const labels: Record<PaymentMethod, string> = {
      CASH: "Efectivo",
      TRANSFER: "Transferencia",
      MIXED: "Mixto",
    };
    return labels[method];
  }, []);

  return {
    transactions,
    getTodayTransactions,
    getTransactionsByDate,
    calculateSummary,
    groupByMonth,
    groupByWeek,
    groupByYear,
    updateTransaction,
    addTransaction,
    todaySummary,
    formatItemsList,
    getEmployeeName,
    formatTime,
    formatMethodLabel,
    reload,
  };
};
