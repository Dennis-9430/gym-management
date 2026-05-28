/* Servicio API para el panel SUPER_ADMIN de gestión de tenants */

import { buildUrl, getAuthHeaders } from "./api";
import type {
  AdminTenant,
  AdminDashboard,
  ManualPaymentRequest,
  ManualPaymentResponse,
  TenantListResponse,
} from "../types/adminTenant.types";

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(buildUrl(endpoint), {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Error de conexión" }));
    throw new Error(err.detail || `Error ${res.status}`);
  }
  return res.json();
}

export const getAdminDashboard = () => apiCall<AdminDashboard>("/api/admin/dashboard");

export const getAdminTenants = (
  params?: {
    status?: string;
    plan?: string;
    search?: string;
    page?: number;
    limit?: number;
  },
) => {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.plan) search.set("plan", params.plan);
  if (params?.search) search.set("search", params.search);
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  return apiCall<TenantListResponse>(`/api/admin/tenants${qs ? `?${qs}` : ""}`);
};

export const getAdminTenantById = (tenantId: string) =>
  apiCall<AdminTenant>(`/api/admin/tenants/${tenantId}`);

export const registerManualPayment = (tenantId: string, data: ManualPaymentRequest) =>
  apiCall<ManualPaymentResponse>(`/api/admin/tenants/${tenantId}/manual-payment`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const suspendTenant = (tenantId: string, reason: string) =>
  apiCall<AdminTenant>(`/api/admin/tenants/${tenantId}/suspend`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });

export const cancelTenant = (tenantId: string, reason: string) =>
  apiCall<AdminTenant>(`/api/admin/tenants/${tenantId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });

export const reactivateTenant = (tenantId: string, reason: string) =>
  apiCall<AdminTenant>(`/api/admin/tenants/${tenantId}/reactivate`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });

export const getTenantPayments = (tenantId: string, page?: number, limit?: number) => {
  const search = new URLSearchParams();
  if (page) search.set("page", String(page));
  if (limit) search.set("limit", String(limit));
  const qs = search.toString();
  return apiCall<{
    items: ManualPaymentResponse[];
    total: number;
    page: number;
    limit: number;
  }>(`/api/admin/tenants/${tenantId}/payments${qs ? `?${qs}` : ""}`);
};

export const getPendingPayments = (page?: number, limit?: number) => {
  const search = new URLSearchParams();
  if (page) search.set("page", String(page));
  if (limit) search.set("limit", String(limit));
  const qs = search.toString();
  return apiCall<{
    items: PendingPaymentItem[];
    total: number;
    page: number;
    limit: number;
  }>(`/api/admin/payments/pending${qs ? `?${qs}` : ""}`);
};

export const approvePayment = (tenantId: string, notes?: string) =>
  apiCall<{ message: string; tenantId: string }>(`/api/admin/tenants/${tenantId}/approve-payment`, {
    method: "POST",
    body: JSON.stringify({ notes: notes || "" }),
  });

export const rejectPayment = (tenantId: string, reason: string) =>
  apiCall<{ message: string; tenantId: string }>(`/api/admin/tenants/${tenantId}/reject-payment`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });

export interface PendingPaymentItem {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  businessCode: string;
  plan: string;
  amount: number;
  currency: string;
  method: string;
  reference?: string;
  receiptUrl?: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export const toggleBiometric = (tenantId: string, enabled: boolean) =>
  apiCall<AdminTenant>(`/api/admin/tenants/${tenantId}/biometric`, {
    method: "PUT",
    body: JSON.stringify({ biometricEnabled: enabled }),
  });

export const updateSuperAdminCredentials = (data: { email?: string; current_password: string; new_password?: string }) =>
  apiCall<{ message: string }>("/api/admin/super-admin/update-credentials", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const deleteTenant = (tenantId: string, password: string) =>
  apiCall<{ message: string; deleted: Record<string, number> }>(`/api/admin/tenants/${tenantId}`, {
    method: "DELETE",
    body: JSON.stringify({ password }),
  });
