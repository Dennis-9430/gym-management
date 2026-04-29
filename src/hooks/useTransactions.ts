import { useMemo, useState, useCallback, useEffect } from "react";
import type { SaleRecord, SaleInput, PaymentMethod } from "../types/sales.types";
import type { CartItem } from "../types/pos.types";
import { getSales, updateSaleAPI, createSaleAPI } from "../services/sales.service";

/**
 * Resumen de transacciones por metodo de pago y tipo de venta.
 * Se utiliza para mostrar estadisticas de ventas en el dashboard.
 */
export interface TransactionSummary {
  /** Total de ingresos por servicios (membresias, packs) */
  services: number;
  /** Total de ingresos por productos del bar */
  bar: number;
  /** Total recibido en efectivo */
  cash: number;
  /** Total recibido por transferencia */
  transfer: number;
  /** Suma total de servicios + bar */
  total: number;
}

/**
 * Datos mensuales para graficos de barras/lineas.
 * Representa un mes especifico con sus totales.
 */
export interface MonthlyData {
  /** Nombre del mes en espanol (ej: enero 2024) */
  month: string;
  /** Clave unica del mes (ej: 2024-01) */
  monthKey: string;
  /** Total de servicios en el mes */
  services: number;
  /** Total de productos del bar en el mes */
  bar: number;
  /** Total general del mes */
  total: number;
}


/**
 * Datos semanales para graficos de actividad por semana.
 * Incluye rango de fechas de cada semana.
 */
export interface WeeklyData {
  /** Etiqueta de la semana (ej: Semana 1) */
  week: string;
  /** Numero de la semana en el mes (1-5) */
  weekNumber: number;
  /** Fecha de inicio de la semana (YYYY-MM-DD) */
  startDate: string;
  /** Fecha de fin de la semana (YYYY-MM-DD) */
  endDate: string;
  /** Total de servicios en la semana */
  services: number;
  /** Total de productos del bar en la semana */
  bar: number;
  /** Total general de la semana */
  total: number;
}

/**
 * Datos anuales para visualizacion de tendencias por mes.
 * Muestra el total acumulado por cada mes del anio.
 */
export interface YearlyData {
  /** Nombre del mes en espanol */
  month: string;
  /** Clave del mes (ej: 2024-01) */
  monthKey: string;
  /** Total del mes */
  total: number;
}

// Palabras clave que identifican items de servicio/membresia
const SERVICE_KEYWORDS = ["mensual", "quincenal", "semanal", "diario", "promo"];

/**
 * Determina si un item del carrito es un servicio o membresia.
 * Se diferencia de los productos del bar para reporting.
 *
 * @param item - Item del carrito a evaluar
 * @returns true si es un servicio/membresia, false si es producto del bar
 */
const isServiceItem = (item: CartItem): boolean => {
  const name = item.name.toLowerCase();
  const category = item.category?.toLowerCase() || "";
  return SERVICE_KEYWORDS.some(k => name.includes(k) || category.includes("servicio"));
};

/**
 * Hook personalizado para gestionar transacciones de ventas.
 * Proporciona funciones de carga, filtrado, y agrupacion de datos de ventas.
 *
 * @returns Objeto con transacciones y funciones utilitarias
 */
export const useTransactions = () => {
  // Estado local de transacciones cargadas desde la API
  const [transactions, setTransactions] = useState<SaleRecord[]>([]);
  // Indicador de carga para UI
  const [loading, setLoading] = useState(true);

  /**
   * Carga todas las transacciones desde la API de ventas.
   * Actualiza el estado local con los datos obtenus.
   * Se ejecuta automaticamente al montar el componente.
   */
  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSales();
      setTransactions(data);
    } catch (error) {
      console.error("Error cargando transacciones:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial al montar el hook
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  /**
   * Recarga las transacciones desde la API.
   * Util para actualizar despues de crear/modificar una venta.
   *
   * @returns Promesa que se resuelve cuando se completa carga
   */
  const reload = useCallback(async () => {
    await loadTransactions();
  }, [loadTransactions]);

  /**
   * Obtiene las transacciones del dia actual.
   * Filtra por fecha y ordena descendente por hora.
   *
   * @returns Array de ventas de hoy ordenadas por fecha
   */
  const getTodayTransactions = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return transactions
      .filter(t => t.createdAt.startsWith(today))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [transactions]);

  /**
   * Filtra transacciones por fecha especifica.
   *
   * @param date - Fecha en formato YYYY-MM-DD
   * @returns Transacciones de esa fecha ordenadas por hora
   */
  const getTransactionsByDate = useCallback((date: string) => {
    return transactions
      .filter(t => t.createdAt.startsWith(date))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [transactions]);

  /**
   * Convierte un array de items a string legible para mostrar.
   * Une los nombres con " + " como separador.
   *
   * @param items - Array de items del carrito
   * @returns String formateado o "-" si no hay items
   */
  const formatItemsList = useCallback((items: CartItem[]): string => {
    if (!items || items.length === 0) return "-";
    return items.map(item => item.name).join(" + ");
  }, []);

  /**
   * Calcula el resumen de ventas agrupado por tipo y metodo de pago.
   *
   * @param txns - Array de transacciones a analizar
   * @returns Objeto con totales de servicios, bar, efectivo y transferencia
   */
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


  /**
   * Agrupa transacciones por mes para graficos.
   *
   * @param txns - Transacciones a agrupar
   * @returns Array de MonthlyData ordenado por mes
   */
  const groupByMonth = useCallback((txns: SaleRecord[]): MonthlyData[] => {
    const grouped: Record<string, MonthlyData> = {};

    for (const txn of txns) {
      const date = new Date(txn.createdAt);
      const monthKey = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");
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


  /**
   * Agrupa transacciones por semana dentro de un mes especifico.
   *
   * @param txns - Transacciones a agrupar
   * @param monthKey - Mes en formato YYYY-MM
   * @returns Array de WeeklyData con rangos de fechas
   */
  const groupByWeek = useCallback((txns: SaleRecord[], monthKey: string): WeeklyData[] => {
    const filtered = txns.filter(t => t.createdAt.startsWith(monthKey));
    const weeks: Record<number, WeeklyData> = {};

    // Calcula el numero de semana del mes
    const getWeekNumber = (date: Date): number => {
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const dayOfMonth = date.getDate();
      return Math.ceil((dayOfMonth + firstDay.getDay()) / 7);
    };

    // Obtiene el rango de fechas para una semana
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
          week: "Semana " + weekNum,
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


  /**
   * Agrupa transacciones por mes para un anio especifico.
   * Mantiene el orden de los 12 meses incluso si no hay datos.
   *
   * @param txns - Transacciones a agrupar
   * @param year - Anio a filtrar (ej: 2024)
   * @returns Array de YearlyData con todos los meses del anio
   */
  const groupByYear = useCallback((txns: SaleRecord[], year: number): YearlyData[] => {
    const filtered = txns.filter(t => t.createdAt.startsWith(String(year)));
    const months: Record<string, YearlyData> = {};

    // Inicializa todos los meses del anio
    for (let i = 0; i < 12; i++) {
      const monthKey = year + "-" + String(i + 1).padStart(2, "0");
      const date = new Date(year, i);
      months[monthKey] = {
        month: date.toLocaleDateString("es-ES", { month: "long" }),
        monthKey,
        total: 0,
      };
    }

    // Acumula los totales de cada mes
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


  /**
   * Actualiza una transaccion existente via API.
   * Recarga los datos automaticamente despues de actualizar.
   *
   * @param id - ID de la venta a actualizar
   * @param update - Datos parciales a actualizar
   * @returns true si la actualizacion fue exitosa
   */
  const updateTransaction = useCallback(async (id: number, update: Partial<SaleRecord>) => {
    const result = await updateSaleAPI(id, update as SaleRecord);
    if (result) {
      await loadTransactions();
    }
  }, [loadTransactions]);


  /**
   * Crea una nueva transaccion via API.
   * Recarga los datos automaticamente despues de crear.
   *
   * @param input - Datos de la nueva venta
   * @returns true si la creacion fue exitosa
   */
  const addTransaction = useCallback(async (input: SaleInput) => {
    const result = await createSaleAPI(input);
    if (result) {
      await loadTransactions();
    }
  }, [loadTransactions]);

  const todaySummary = useMemo(() => calculateSummary(getTodayTransactions), [calculateSummary, getTodayTransactions]);


  /**
   * Obtiene el nombre del empleado que creo la transaccion.
   *
   * @param createdBy - Nombre del creador (opcional)
   * @returns Nombre del empleado o "Sistema" por defecto
   */
  const getEmployeeName = useCallback((createdBy?: string): string => {
    return createdBy || "Sistema";
  }, []);


  /**
   * Formatea una fecha a hora legible en formato 24h.
   *
   * @param createdAt - Fecha ISO de la transaccion
   * @returns Hora formateada (ej: 14:30)
   */
  const formatTime = useCallback((createdAt: string): string => {
    const date = new Date(createdAt);
    return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  }, []);


  /**
   * Convierte el metodo de pago a etiqueta legible.
   *
   * @param method - Metodo de pago (CASH, TRANSFER, MIXED)
   * @returns Etiqueta en espanol
   */
  const formatMethodLabel = useCallback((method: PaymentMethod): string => {
    const labels: Record<PaymentMethod, string> = {
      CASH: "Efectivo",
      TRANSFER: "Transferencia",
      DEPOSIT: "Depósito",
      MIXED: "Mixto",
    };
    return labels[method];
  }, []);

  return {
    transactions,
    loading,
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
