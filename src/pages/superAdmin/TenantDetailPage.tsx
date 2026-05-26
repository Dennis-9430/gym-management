/* Detalle de tenant con historial de pagos para SUPER_ADMIN */
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Building2,
  Ban,
  X,
  Play,
  CreditCard,
  DollarSign,
  Calendar,
  Hash,
  User,
  Shield,
  Lock,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { getAdminTenantById, suspendTenant, cancelTenant, reactivateTenant, getTenantPayments, deleteTenant } from "../../services/adminTenants.service";
import { registerManualPayment } from "../../services/adminTenants.service";
import { TenantStatusBadge } from "../../components/superAdmin/TenantStatusBadge";
import { ManualPaymentModal } from "../../components/superAdmin/ManualPaymentModal";
import SuperAdminLayout from "../../components/superAdmin/SuperAdminLayout";
import type { AdminTenant, ManualPaymentResponse, ManualPaymentRequest } from "../../types/adminTenant.types";

const PAGE_SIZE = 10;

const TenantDetailPage = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();

  const [tenant, setTenant] = useState<AdminTenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Payment history
  const [payments, setPayments] = useState<ManualPaymentResponse[]>([]);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  // Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Action loading
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchTenant = useCallback(async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      setError("");
      const result = await getAdminTenantById(tenantId);
      setTenant(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar tenant");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const fetchPayments = useCallback(async () => {
    if (!tenantId) return;
    try {
      setPaymentsLoading(true);
      const result = await getTenantPayments(tenantId, paymentsPage, PAGE_SIZE);
      setPayments(result.items);
      setPaymentsTotal(result.total);
    } catch {
      // Non-critical, silently fail
    } finally {
      setPaymentsLoading(false);
    }
  }, [tenantId, paymentsPage]);

  useEffect(() => {
    fetchTenant();
  }, [fetchTenant]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const totalPages = Math.ceil(paymentsTotal / PAGE_SIZE);

  const handleManualPayment = async (data: ManualPaymentRequest) => {
    if (!tenantId) return;
    await registerManualPayment(tenantId, data);
    // Refresh tenant and payments
    await Promise.all([fetchTenant(), fetchPayments()]);
  };

  const handleDelete = async () => {
    if (!tenantId || !deletePassword) return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      const result = await deleteTenant(tenantId, deletePassword);
      alert(result.message);
      navigate("/super-admin/tenants");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Error al eliminar tenant");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAction = async (
    action: "suspend" | "cancel" | "reactivate",
    verb: string,
  ) => {
    if (!tenant || !tenantId) return;

    const reason = window.prompt(`Motivo para ${verb} "${tenant.businessName}":`);
    if (reason === null) return;
    if (!reason.trim()) {
      alert("Debe ingresar un motivo.");
      return;
    }

    if (action === "cancel") {
      if (!window.confirm(`¿Está seguro de cancelar definitivamente "${tenant.businessName}"? Esta acción no se puede revertir.`)) {
        return;
      }
    }

    setActionLoading(action);
    try {
      if (action === "suspend") await suspendTenant(tenantId, reason.trim());
      else if (action === "cancel") await cancelTenant(tenantId, reason.trim());
      else await reactivateTenant(tenantId, reason.trim());
      await fetchTenant();
    } catch (err) {
      alert(err instanceof Error ? err.message : `Error al ${verb} tenant`);
    } finally {
      setActionLoading(null);
    }
  };

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
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <AlertTriangle size={48} style={{ margin: "0 auto 16px", color: "#dc2626" }} />
          <p style={{ color: "#dc2626" }}>{error}</p>
          <button onClick={() => navigate("/super-admin/tenants")} style={backBtnStyle}>
            Volver a tenants
          </button>
        </div>
      </SuperAdminLayout>
    );
  }

  if (!tenant) return null;

  const canSuspendOrCancel = tenant.subscriptionStatus !== "SUSPENDED" && tenant.subscriptionStatus !== "CANCELLED";
  const canReactivate = tenant.subscriptionStatus === "SUSPENDED";

  return (
    <SuperAdminLayout>
      {/* Back button */}
      <button
        onClick={() => navigate("/super-admin/tenants")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          color: "#3b82f6",
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 500,
          padding: 0,
          marginBottom: 20,
        }}
      >
        <ArrowLeft size={16} />
        Volver a tenants
      </button>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>{tenant.businessName}</h2>
            <TenantStatusBadge status={tenant.subscriptionStatus} />
          </div>
          <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>
            Código: <span style={{ fontFamily: "monospace" }}>{tenant.businessCode}</span>
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => setShowPaymentModal(true)}
            style={actionBtnStyle("#22c55e")}
            disabled={actionLoading !== null}
          >
            <CreditCard size={16} />
            Registrar pago
          </button>
          {canSuspendOrCancel && (
            <>
              <button
                onClick={() => handleAction("suspend", "suspender")}
                style={actionBtnStyle("#eab308")}
                disabled={actionLoading !== null}
              >
                {actionLoading === "suspend" ? <Loader2 size={16} className="login__spinner" /> : <Ban size={16} />}
                Suspender
              </button>
              <button
                onClick={() => handleAction("cancel", "cancelar")}
                style={actionBtnStyle("#ef4444")}
                disabled={actionLoading !== null}
              >
                {actionLoading === "cancel" ? <Loader2 size={16} className="login__spinner" /> : <X size={16} />}
                Cancelar
              </button>
            </>
          )}
          {canReactivate && (
            <button
              onClick={() => handleAction("reactivate", "reactivar")}
              style={actionBtnStyle("#22c55e")}
              disabled={actionLoading !== null}
            >
              {actionLoading === "reactivate" ? <Loader2 size={16} className="login__spinner" /> : <Play size={16} />}
              Reactivar
            </button>
          )}
          <button
            onClick={() => { setDeletePassword(""); setDeleteError(""); setShowDeleteModal(true); }}
            style={actionBtnStyle("#dc2626")}
            disabled={actionLoading !== null}
          >
            <Trash2 size={16} />
            Eliminar
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 32 }}>
        <InfoCard icon={<Building2 size={18} />} label="Negocio" value={tenant.businessName} />
        <InfoCard icon={<Hash size={18} />} label="Código" value={tenant.businessCode} mono />
        <InfoCard icon={<User size={18} />} label="Propietario" value={[tenant.ownerFirstName, tenant.ownerLastName].filter(Boolean).join(" ") || "—"} />
        <InfoCard icon={<MailIcon size={18} />} label="Email" value={tenant.email} />
        <InfoCard icon={<Shield size={18} />} label="Plan" value={tenant.plan} badge={tenant.plan === "PREMIUM" ? "#7c3aed" : "#2563eb"} />
        <InfoCard icon={<Lock size={18} />} label="Estado" value={tenant.subscriptionStatus} status />
        <InfoCard icon={<Calendar size={18} />} label="Vencimiento" value={tenant.subscriptionEndDate ? new Date(tenant.subscriptionEndDate).toLocaleDateString("es-ES") : "—"} />
        <InfoCard icon={<Calendar size={18} />} label="Creado" value={new Date(tenant.createdAt).toLocaleDateString("es-ES")} />
        <InfoCard icon={<DollarSign size={18} />} label="Moneda" value={tenant.currency} />
        <InfoCard icon={<FileTextIcon size={18} />} label="RUC" value={tenant.businessRuc || "—"} />
        <InfoCard icon={<PhoneIcon size={18} />} label="Teléfono" value={tenant.businessPhone || "—"} />
        <InfoCard icon={<MapPinIcon size={18} />} label="Dirección" value={tenant.businessAddress || "—"} />
        {tenant.isDemo && (
          <InfoCard icon={<DemoIcon size={18} />} label="Tipo" value="Demo" badge="#f97316" />
        )}
      </div>

      {/* Payment History */}
      <div style={{ backgroundColor: "#fff", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#0f172a" }}>Historial de pagos</h3>
          {paymentsTotal > 0 && (
            <span style={{ fontSize: 13, color: "#64748b" }}>{paymentsTotal} pago{paymentsTotal !== 1 ? "s" : ""}</span>
          )}
        </div>
        {paymentsLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px 20px" }}>
            <Loader2 size={20} className="login__spinner" style={{ color: "#3b82f6" }} />
          </div>
        ) : payments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
            <DollarSign size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
            <p>No hay pagos registrados</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", color: "#64748b", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={thStyle}>Fecha</th>
                  <th style={thStyle}>Plan</th>
                  <th style={thStyle}>Monto</th>
                  <th style={thStyle}>Meses</th>
                  <th style={thStyle}>Método</th>
                  <th style={thStyle}>Referencia</th>
                  <th style={thStyle}>Inicio</th>
                  <th style={thStyle}>Fin</th>
                  <th style={thStyle}>Registrado por</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={tdStyle}>{new Date(p.createdAt).toLocaleDateString("es-ES")}</td>
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
                    <td style={{ ...tdStyle, fontWeight: 600 }}>${p.amount.toFixed(2)}</td>
                    <td style={tdStyle}>{p.months}</td>
                    <td style={tdStyle}>
                      {p.method === "CASH" ? "Efectivo" : p.method === "TRANSFER" ? "Transferencia" : "Otro"}
                    </td>
                    <td style={{ ...tdStyle, color: "#64748b" }}>{p.reference || "—"}</td>
                    <td style={tdStyle}>{new Date(p.subscriptionStartDate).toLocaleDateString("es-ES")}</td>
                    <td style={tdStyle}>{new Date(p.subscriptionEndDate).toLocaleDateString("es-ES")}</td>
                    <td style={{ ...tdStyle, color: "#64748b" }}>{p.registeredBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!paymentsLoading && totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, padding: "12px 20px", borderTop: "1px solid #e2e8f0" }}>
            <button
              disabled={paymentsPage <= 1}
              onClick={() => setPaymentsPage((p) => Math.max(1, p - 1))}
              style={{ ...pageBtnStyle, opacity: paymentsPage <= 1 ? 0.5 : 1 }}
            >
              Anterior
            </button>
            <span style={{ fontSize: 14, color: "#64748b" }}>
              Página {paymentsPage} de {totalPages}
            </span>
            <button
              disabled={paymentsPage >= totalPages}
              onClick={() => setPaymentsPage((p) => Math.min(totalPages, p + 1))}
              style={{ ...pageBtnStyle, opacity: paymentsPage >= totalPages ? 0.5 : 1 }}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <ManualPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handleManualPayment}
        currentPlan={tenant.plan}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}
        >
          <div
            style={{
              backgroundColor: "#fff", borderRadius: 12, padding: 32,
              maxWidth: 440, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                backgroundColor: "#fef2f2", display: "flex",
                alignItems: "center", justifyContent: "center",
                color: "#dc2626", flexShrink: 0,
              }}>
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                  Eliminar "{tenant.businessName}"
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
                  Esta operación es IRREVERSIBLE. Se borrarán TODOS los datos del gimnasio.
                </p>
              </div>
            </div>

            <div style={{
              backgroundColor: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: 8, padding: "12px 16px", marginBottom: 20,
              fontSize: 13, color: "#991b1b",
            }}>
              <strong>⛔ Atención:</strong> empleados, clientes, ventas, facturas, productos,
              servicios, asistencias, huellas y pagos — todo se eliminará permanentemente.
            </div>

            {deleteError && (
              <div style={{
                backgroundColor: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: 8, padding: "8px 12px", marginBottom: 16,
                fontSize: 13, color: "#dc2626",
              }}>
                {deleteError}
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Ingresá tu contraseña de SUPER_ADMIN para confirmar
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showDeletePassword ? "text" : "password"}
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Contraseña"
                  autoFocus
                  style={{
                    width: "100%", padding: "10px 40px 10px 12px",
                    border: "1px solid #d1d5db", borderRadius: 8,
                    fontSize: 14, outline: "none", boxSizing: "border-box",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && deletePassword && !deleteLoading) {
                      handleDelete();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowDeletePassword(!showDeletePassword)}
                  style={{
                    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "#9ca3af", padding: 4, display: "flex",
                  }}
                >
                  {showDeletePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                style={{
                  padding: "10px 20px", border: "1px solid #d1d5db",
                  borderRadius: 8, backgroundColor: "#fff",
                  color: "#374151", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", opacity: deleteLoading ? 0.6 : 1,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={!deletePassword || deleteLoading}
                style={{
                  padding: "10px 20px", border: "none", borderRadius: 8,
                  backgroundColor: deletePassword ? "#dc2626" : "#fca5a5",
                  color: "#fff", fontSize: 14, fontWeight: 600,
                  cursor: deletePassword ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {deleteLoading ? (
                  <><Loader2 size={16} className="login__spinner" /> Eliminando...</>
                ) : (
                  <><Trash2 size={16} /> Eliminar permanentemente</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
};

/* Info Card Component */
const InfoCard = ({
  icon,
  label,
  value,
  mono,
  status,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  status?: boolean;
  badge?: string;
}) => (
  <div style={{ backgroundColor: "#fff", borderRadius: 10, padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <span style={{ color: "#64748b", display: "flex" }}>{icon}</span>
      <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
    </div>
    {status ? (
      <TenantStatusBadge status={value} />
    ) : badge ? (
      <span style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 600,
        backgroundColor: `${badge}20`,
        color: badge,
      }}>
        {value}
      </span>
    ) : (
      <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", fontFamily: mono ? "monospace" : "inherit" }}>
        {value}
      </div>
    )}
  </div>
);

/* Mini SVG icons */
const MailIcon = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const FileTextIcon = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);

const PhoneIcon = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MapPinIcon = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const DemoIcon = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
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

const actionBtnStyle = (color: string): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 16px",
  border: `1px solid ${color}`,
  borderRadius: 8,
  backgroundColor: "#fff",
  color,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.15s",
});

const pageBtnStyle: React.CSSProperties = {
  padding: "6px 14px",
  border: "1px solid #cbd5e1",
  borderRadius: 6,
  backgroundColor: "#fff",
  color: "#475569",
  fontSize: 13,
  cursor: "pointer",
};

const backBtnStyle: React.CSSProperties = {
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

export default TenantDetailPage;
