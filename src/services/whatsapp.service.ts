/* API de WhatsApp Notifications */
// Configuración de API - usa variable de entorno o fallback
const getApiBaseUrl = () => import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_BASE = `${getApiBaseUrl()}/api/notifications`;

export interface WhatsAppConfig {
  type: "expiry" | "scheduled";
  message: string;
  scheduledDate?: string;
  scheduledTime?: string;
  expiryHour?: number;
  enabled?: boolean;
}

export interface NotificationLog {
  id: string;
  clientId: string;
  type: string;
  message: string;
  status: string;
  sentAt: string;
}

export interface SchedulerStatus {
  running: boolean;
  jobs: Array<{ id: string; next_run: string | null }>;
}

/* Obtener todas las configuraciones */
export const getConfigs = async (): Promise<WhatsAppConfig[]> => {
  const response = await fetch(`${API_BASE}/configs`);
  if (!response.ok) throw new Error("Error al obtener configs");
  return response.json();
};

/* Obtener configuración por tipo */
export const getConfig = async (type: string): Promise<WhatsAppConfig> => {
  const response = await fetch(`${API_BASE}/configs/${type}`);
  if (!response.ok) throw new Error("Config no encontrada");
  return response.json();
};

/* Guardar configuración */
export const saveConfig = async (config: WhatsAppConfig): Promise<void> => {
  const response = await fetch(`${API_BASE}/configs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  if (!response.ok) throw new Error("Error al guardar config");
};

/* Eliminar configuración */
export const deleteConfig = async (type: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/configs/${type}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Error al eliminar config");
};

/* Obtener logs */
export const getLogs = async (limit = 100): Promise<NotificationLog[]> => {
  const response = await fetch(`${API_BASE}/logs?limit=${limit}`);
  if (!response.ok) throw new Error("Error al obtener logs");
  return response.json();
};

/* Obtener logs de hoy */
export const getTodayLogs = async (): Promise<NotificationLog[]> => {
  const response = await fetch(`${API_BASE}/logs/today`);
  if (!response.ok) throw new Error("Error al obtener logs");
  return response.json();
};

/* Enviar notificación manual (test) */
export const sendManualNotification = async (
  clientId: string,
  message: string
): Promise<{ status: string }> => {
  const response = await fetch(`${API_BASE}/send/manual`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, message }),
  });
  if (!response.ok) throw new Error("Error al enviar");
  return response.json();
};

/* Control del scheduler */
export const startScheduler = async (): Promise<{ status: string }> => {
  const response = await fetch(`${API_BASE}/scheduler/start`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Error al iniciar scheduler");
  return response.json();
};

export const stopScheduler = async (): Promise<{ status: string }> => {
  const response = await fetch(`${API_BASE}/scheduler/stop`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Error al detener scheduler");
  return response.json();
};

export const getSchedulerStatus = async (): Promise<SchedulerStatus> => {
  const response = await fetch(`${API_BASE}/scheduler/status`);
  if (!response.ok) throw new Error("Error al obtener estado");
  return response.json();
};