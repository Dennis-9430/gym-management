import { useMemo, useState, useCallback } from "react";
import type { SaleRecord, SaleInput, PaymentMethod } from "../types/sales.types";
import type { CartItem } from "../types/pos.types";
import { getSales, updateSale, createSale } from "../services/sales.service";

export interface TransactionSummary {
  services: number;
  bar: number;
  cash: number;
  transfer: number;
  total: number;
}

export interface MonthlyData {
  month: string;
  monthKey: string;
  services: number;
  bar: number;
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
