/* API de WhatsApp Notifications */
import { apiGet, apiPost, apiPut, apiDelete } from "./api";

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
  return apiGet("/api/notifications/configs");
};

/* Obtener configuración por tipo */
export const getConfig = async (type: string): Promise<WhatsAppConfig> => {
  return apiGet(`/api/notifications/configs/${type}`);
};

/* Guardar configuración */
export const saveConfig = async (config: WhatsAppConfig): Promise<void> => {
  await apiPost("/api/notifications/configs", config);
};

/* Eliminar configuración */
export const deleteConfig = async (type: string): Promise<void> => {
  await apiDelete(`/api/notifications/configs/${type}`);
};

/* Obtener logs */
export const getLogs = async (limit = 100): Promise<NotificationLog[]> => {
  return apiGet(`/api/notifications/logs?limit=${limit}`);
};

/* Obtener logs de hoy */
export const getTodayLogs = async (): Promise<NotificationLog[]> => {
  return apiGet("/api/notifications/logs/today");
};

/* Enviar notificación manual (test) */
export const sendManualNotification = async (
  clientId: string,
  message: string
): Promise<{ status: string }> => {
  return apiPost("/api/notifications/send/manual", { client_id: clientId, message });
};

/* Control del scheduler */
export const startScheduler = async (): Promise<{ status: string }> => {
  return apiPost("/api/notifications/scheduler/start", {});
};

export const stopScheduler = async (): Promise<{ status: string }> => {
  return apiPost("/api/notifications/scheduler/stop", {});
};

export const getSchedulerStatus = async (): Promise<SchedulerStatus> => {
  return apiGet("/api/notifications/scheduler/status");
};