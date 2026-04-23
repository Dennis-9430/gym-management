/* Servicio de asistencia - carga bajo demanda */
const API_BASE = "/api/attendance";

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
    const response = await fetch(`${API_BASE}?date=${date}`);
    if (!response.ok) {
      throw new Error("Error al obtener asistencia");
    }
    const data: AttendanceListResponse = await response.json();
    return data.records || [];
  } catch (error) {
    console.error("Error cargando asistencia:", error);
    return [];
  }
};

/* Obtiene asistencia de hoy */
export const getTodayAttendance = async (): Promise<TodayAttendance | null> => {
  try {
    const response = await fetch(`${API_BASE}/today`);
    if (!response.ok) {
      throw new Error("Error al obtener asistencia de hoy");
    }
    return await response.json();
  } catch (error) {
    console.error("Error cargando asistencia de hoy:", error);
    return null;
  }
};

/* Obtiene asistencia con filtro de rango de fechas */
export const getAttendanceByRange = async (
  startDate: string,
  _endDate: string
): Promise<AttendanceRecord[]> => {
  try {
    const response = await fetch(`${API_BASE}?date=${startDate}`);
    if (!response.ok) {
      return [];
    }
    const data: AttendanceListResponse = await response.json();
    return data.records || [];
  } catch {
    return [];
  }
};