/* Servicio de asistencia - carga bajo demanda */
import { getAuthToken } from "./api";

// Configuración de API - usa variable de entorno o fallback
const getApiBaseUrl = () => import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_BASE = `${getApiBaseUrl()}/api/attendance`;

const getHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

export interface AttendanceRecord {
  _id: string;
  clientId: number;
  clientName: string;
  checkIn: string;
  checkOut: string | null;
  date: string;
}

export interface AttendanceListResponse {
  records: AttendanceRecord[];
  total: number;
}

export interface TodayAttendance {
  date: string;
  total: number;
  currentlyIn: number;
}

/* Obtiene asistencia por fecha */
export const getAttendanceByDate = async (date: string): Promise<AttendanceRecord[]> => {
  try {
    const response = await fetch(`${API_BASE}?date=${date}`, { headers: getHeaders() });
    if (!response.ok) {
      throw new Error("Error al obtener asistencia");
    }
    const data: AttendanceListResponse = await response.json();
    return data.records || [];
  } catch (error) {
    return [];
  }
};

/* Obtiene asistencia de hoy */
export const getTodayAttendance = async (): Promise<TodayAttendance | null> => {
  try {
    const response = await fetch(`${API_BASE}/today`, { headers: getHeaders() });
    if (!response.ok) {
      throw new Error("Error al obtener asistencia de hoy");
    }
    return await response.json();
  } catch (error) {
    return null;
  }
};

/* Obtiene asistencia con filtro de rango de fechas */
export const getAttendanceByRange = async (
  startDate: string,
  _endDate: string
): Promise<AttendanceRecord[]> => {
  try {
    const response = await fetch(`${API_BASE}?date=${startDate}`, { headers: getHeaders() });
    if (!response.ok) {
      return [];
    }
    const data: AttendanceListResponse = await response.json();
    return data.records || [];
  } catch {
    return [];
  }
};