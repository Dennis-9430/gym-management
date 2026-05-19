/* Dashboard del panel SUPER_ADMIN con resumen de tenants y pagos */
import { useState, useEffect } from "react";
import {
  Building2,
  Users,
  AlertTriangle,
  Ban,
  DollarSign,
  Clock,
  Loader2,
} from "lucide-react";
import { getAdminDashboard } from "../../services/adminTenants.service";
import type { AdminDashboard } from "../../types/adminTenant.types";

const SuperAdminDashboard = () => {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getAdminDashboard();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <SuperAdminLayout>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
          <Loader2 size={32} className="login__spinner" style={{ color: "#3b82f6" }} />
        </div>
      </SuperAdminLayout>
    );
  }

  if (error) {
    return (
      <SuperAdminLayout>
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#dc2626" }}>
          <AlertTriangle size={48} style={{ margin: "0 auto 16px" }} />
          <p>{error}</p>
          <button onClick={() => window.location.reload()} style={retryBtnStyle}>
            Reintentar
          </button>
        </div>
      </SuperAdminLayout>
    );
  }

  if (!data) return null;

  const cards = [
    { label: "Total Tenants", value: data.total_tenants, icon: <Building2 size={20} />, color: "#3b82f6" },
    { label: "Activos", value: data.active, icon: <Users size={20} />, color: "#22c55e" },
    { label: "Pendientes de pago", value: data.pending_payment, icon: <Clock size={20} />, color: "#eab308" },
    { label: "Suspendidos", value: data.suspended, icon: <Ban size={20} />, color: "#ef4444" },
    { label: "Cancelados", value: data.cancelled, icon: <AlertTriangle size={20} />, color: "#6b7280" },
    { label: "Ingresos del mes", value: `$${data.monthly_revenue.toFixed(2)}`, icon: <DollarSign size={20} />, color: "#10b981" },
    { label: "Próximos a vencer", value: data.expiring_soon, icon: <Clock size={20} />, color: "#f97316" },
  ];

  return (
    <SuperAdminLayout>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>Panel de Administración</h2>
      <p style={{ color: "#64748b", margin: "0 0 24px", fontSize: 14 }}>
        Resumen general del sistema
      </p>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
        {cards.map((card) => (
          <div
            key={card.label}
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: "20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ color: card.color }}>{card.icon}</span>
              <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{card.label}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#0f172a" }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Payments */}
      <div style={{ backgroundColor: "#fff", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#0f172a" }}>Pagos recientes</h3>
        </div>
        {data.recent_payments.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8" }}>
            No hay pagos recientes
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", color: "#64748b", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={thStyle}>Tenant</th>
                  <th style={thStyle}>Plan</th>
                  <th style={thStyle}>Monto</th>
                  <th style={thStyle}>Método</th>
                  <th style={thStyle}>Vencimiento</th>
                  <th style={thStyle}>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_payments.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={tdStyle}>{p.tenantId}</td>
                    <td style={tdStyle}>
                      <span style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        backgroundColor: p.plan === "PREMIUM" ? "#f3e8ff" : "#dbeafe",
                        color: p.plan === "PREMIUM" ? "#7c3aed" : "#2563eb",
                      }}>
                        {p.plan}
                      </span>
                    </td>
                    <td style={tdStyle}>${p.amount.toFixed(2)}</td>
                    <td style={tdStyle}>
                      {p.method === "CASH" ? "Efectivo" : p.method === "TRANSFER" ? "Transferencia" : "Otro"}
                    </td>
                    <td style={tdStyle}>
                      {new Date(p.subscriptionEndDate).toLocaleDateString("es-ES")}
                    </td>
                    <td style={tdStyle}>
                      {new Date(p.createdAt).toLocaleDateString("es-ES")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
};

/* Layout mínimo para páginas de SUPER_ADMIN (sin MainLayout) */
const SuperAdminLayout = ({ children }: { children: React.ReactNode }) => (
  <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
    {/* Top bar */}
    <div style={{ backgroundColor: "#0f172a", color: "#fff", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Gym Management</h1>
        <span style={{ fontSize: 12, backgroundColor: "#3b82f6", padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>SUPER ADMIN</span>
      </div>
      <nav style={{ display: "flex", gap: 16, fontSize: 14 }}>
        <a href="/super-admin/dashboard" style={{ color: "#94a3b8", textDecoration: "none" }}>Dashboard</a>
        <a href="/super-admin/tenants" style={{ color: "#94a3b8", textDecoration: "none" }}>Tenants</a>
      </nav>
    </div>
    {/* Content */}
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
      {children}
    </div>
  </div>
);

const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  textAlign: "left",
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  color: "#334155",
};

const retryBtnStyle: React.CSSProperties = {
  marginTop: 16,
  padding: "10px 24px",
  border: "none",
  borderRadius: 8,
  backgroundColor: "#3b82f6",
  color: "#fff",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

export default SuperAdminDashboard;
