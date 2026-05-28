/* Dashboard del panel SUPER_ADMIN con resumen de tenants y pagos */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  AlertTriangle,
  Ban,
  DollarSign,
  Clock,
  Loader2,
  Settings,
  Save,
  X,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import { getAdminDashboard, updateSuperAdminCredentials } from "../../services/adminTenants.service";
import type { AdminDashboard } from "../../types/adminTenant.types";
import SuperAdminLayout from "../../components/superAdmin/SuperAdminLayout";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Credential update state
  const [credEmail, setCredEmail] = useState("");
  const [credCurrentPass, setCredCurrentPass] = useState("");
  const [credNewPass, setCredNewPass] = useState("");
  const [credMessage, setCredMessage] = useState("");
  const [credError, setCredError] = useState(false);
  const [credSaving, setCredSaving] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const handleCredSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credCurrentPass) return;
    setCredSaving(true);
    setCredMessage("");
    setCredError(false);
    try {
      const res = await updateSuperAdminCredentials({
        email: credEmail || undefined,
        current_password: credCurrentPass,
        new_password: credNewPass || undefined,
      });
      setCredMessage(res.message);
      setCredError(false);
      setCredCurrentPass("");
      setCredNewPass("");
    } catch (err) {
      setCredMessage(err instanceof Error ? err.message : "Error al actualizar");
      setCredError(true);
    } finally {
      setCredSaving(false);
    }
  };

  const clearCredForm = () => {
    setCredMessage("");
    setCredError(false);
    setCredEmail("");
    setCredCurrentPass("");
    setCredNewPass("");
  };

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
    { label: "Pendientes de pago", value: data.pending_payment, icon: <Clock size={20} />, color: "#eab308", link: "/super-admin/payments/pending" },
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
            {...(card as { link?: string }).link ? { onClick: () => navigate((card as { link: string }).link) } : {}}
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: "20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              border: "1px solid #e2e8f0",
              cursor: (card as { link?: string }).link ? "pointer" : "default",
              transition: "box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              if ((card as { link?: string }).link) {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)";
              }
            }}
            onMouseLeave={(e) => {
              if ((card as { link?: string }).link) {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)";
              }
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
          <div className="sa-table-responsive-wrapper">
            <table className="sa-table-responsive" style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
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
                    <td data-label="Tenant" style={{ ...tdStyle, fontFamily: "monospace", fontSize: 13 }}>{p.businessName || p.tenantId}</td>
                    <td data-label="Plan" style={tdStyle}>
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
                    <td data-label="Monto" style={tdStyle}>${p.amount.toFixed(2)}</td>
                    <td data-label="Método" style={tdStyle}>
                      {p.method === "CASH" ? "Efectivo" : p.method === "TRANSFER" ? "Transferencia" : "Otro"}
                    </td>
                    <td data-label="Vencimiento" style={tdStyle}>
                      {new Date(p.subscriptionEndDate).toLocaleDateString("es-ES")}
                    </td>
                    <td data-label="Fecha" style={tdStyle}>
                      {new Date(p.createdAt).toLocaleDateString("es-ES")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Credential Update */}
      <div style={{
        backgroundColor: "#fff", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        border: "1px solid #e2e8f0", padding: 20, marginTop: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Settings size={18} color="#64748b" />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#0f172a" }}>
            Credenciales de administrador
          </h3>
        </div>

        {credMessage && (
          <div style={{
            padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 14,
            backgroundColor: credError ? "#fef2f2" : "#f0fdf4",
            color: credError ? "#dc2626" : "#16a34a",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            {credError ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
            {credMessage}
          </div>
        )}

        <form onSubmit={handleCredSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400 }}>
          <input
            type="email"
            placeholder="Nuevo email"
            value={credEmail}
            onChange={(e) => setCredEmail(e.target.value)}
            style={inputStyle}
          />
          <div style={{ position: "relative" }}>
            <input
              type={showCurrentPass ? "text" : "password"}
              placeholder="Contraseña actual *"
              value={credCurrentPass}
              onChange={(e) => setCredCurrentPass(e.target.value)}
              required
              style={inputStyle}
            />
            <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
              {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div style={{ position: "relative" }}>
            <input
              type={showNewPass ? "text" : "password"}
              placeholder="Nueva contraseña"
              value={credNewPass}
              onChange={(e) => setCredNewPass(e.target.value)}
              style={inputStyle}
            />
            <button type="button" onClick={() => setShowNewPass(!showNewPass)}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
              {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" disabled={credSaving} style={{
              ...btnStyle, backgroundColor: "#3b82f6", color: "#fff",
              opacity: credSaving ? 0.6 : 1, cursor: credSaving ? "not-allowed" : "pointer",
            }}>
              {credSaving ? <Loader2 size={16} className="login__spinner" /> : <Save size={16} />}
              Guardar cambios
            </button>
            {credMessage && !credError && (
              <button type="button" onClick={clearCredForm} style={{ ...btnStyle, backgroundColor: "#f1f5f9", color: "#64748b" }}>
                <X size={16} /> Cerrar
              </button>
            )}
          </div>
        </form>
      </div>
    </SuperAdminLayout>
  );
};

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

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const btnStyle: React.CSSProperties = {
  padding: "10px 16px",
  border: "none",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 6,
};

export default SuperAdminDashboard;
