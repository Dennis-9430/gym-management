/* Badge de estado para tenants en el panel SUPER_ADMIN */

interface Props {
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "#22c55e",
  PENDING_PAYMENT: "#eab308",
  EXPIRED: "#f97316",
  SUSPENDED: "#ef4444",
  CANCELLED: "#6b7280",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Activo",
  PENDING_PAYMENT: "Pendiente de pago",
  EXPIRED: "Vencido",
  SUSPENDED: "Suspendido",
  CANCELLED: "Cancelado",
};

export const TenantStatusBadge = ({ status }: Props) => (
  <span
    style={{
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: 600,
      color: "#fff",
      backgroundColor: STATUS_STYLES[status] || "#6b7280",
    }}
  >
    {STATUS_LABELS[status] || status}
  </span>
);
