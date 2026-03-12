import type { SaleInput, SaleRecord } from "../types/sales.types";

const STORAGE_KEY = "gym-management.sales";

const loadSales = (): SaleRecord[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as SaleRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveSales = (sales: SaleRecord[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
};

export const getSales = (): SaleRecord[] => {
  return loadSales();
};

export const createSale = (input: SaleInput): SaleRecord => {
  const sales = loadSales();
  const nextId = sales.length ? Math.max(...sales.map((sale) => sale.id)) + 1 : 1;

  const record: SaleRecord = {
    id: nextId,
    createdAt: new Date().toISOString(),
    ...input,
  };

  saveSales([...sales, record]);
  return record;
};
