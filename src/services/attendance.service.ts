/* Servicio de asistencia - carga bajo demanda */
import { apiGet } from "./api";

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
    const data: AttendanceListResponse = await apiGet(`/api/attendance?date=${date}`);
    return data.records || [];
  } catch {
    return [];
  }
};

/* Obtiene asistencia de hoy */
export const getTodayAttendance = async (): Promise<TodayAttendance | null> => {
  try {
    return await apiGet("/api/attendance/today");
  } catch {
    return null;
  }
};

/* Obtiene asistencia con filtro de rango de fechas */
export const getAttendanceByRange = async (
  startDate: string,
  _endDate: string
): Promise<AttendanceRecord[]> => {
  try {
    const data: AttendanceListResponse = await apiGet(`/api/attendance?date=${startDate}`);
    return data.records || [];
  } catch {
    return [];
  }
};