/* Tipos para el panel SUPER_ADMIN de gestión de tenants */

export type TenantStatus = "ACTIVE" | "PENDING_PAYMENT" | "EXPIRED" | "SUSPENDED" | "CANCELLED";
export type SubscriptionPlan = "BASIC" | "PREMIUM";
export type PaymentMethod = "CASH" | "TRANSFER" | "OTHER";

export interface AdminTenant {
  id: string;
  tenantId: string;
  businessCode: string;
  businessName: string;
  email: string;
  plan: SubscriptionPlan;
  subscriptionStatus: TenantStatus;
  subscriptionEndDate: string | null;
  ownerFirstName?: string;
  ownerLastName?: string;
  businessPhone?: string;
  businessAddress?: string;
  businessRuc?: string;
  taxRate: number;
  currency: string;
  isDemo: boolean;
  biometricEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ManualPaymentRequest {
  plan: SubscriptionPlan;
  months: number;
  amount: number;
  currency: string;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface ManualPaymentResponse {
  id: string;
  tenantId: string;
  amount: number;
  currency: string;
  months: number;
  plan: SubscriptionPlan;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  registeredBy: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  createdAt: string;
}

export interface AdminDashboard {
  total_tenants: number;
  active: number;
  pending_payment: number;
  suspended: number;
  cancelled: number;
  expired: number;
  monthly_revenue: number;
  recent_payments: ManualPaymentResponse[];
  expiring_soon: number;
}

export interface TenantListResponse {
  items: AdminTenant[];
  total: number;
  page: number;
  limit: number;
}
