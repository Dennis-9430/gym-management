/* Pagos por transferencia pendientes de aprobación */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertTriangle, CheckCircle, XCircle, DollarSign, ExternalLink } from "lucide-react";
import SuperAdminLayout from "../../components/superAdmin/SuperAdminLayout";
import {
  getPendingPayments,
  approvePayment,
  rejectPayment,
} from "../../services/adminTenants.service";
import type { PendingPaymentItem } from "../../services/adminTenants.service";

const PAGE_SIZE = 10;

const PendingPaymentsPage = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PendingPaymentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    payment: PendingPaymentItem | null;
  }>({ open: false, payment: null });
  const [rejectReason, setRejectReason] = useState("");

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getPendingPayments(page, PAGE_SIZE);
      setPayments(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar pagos pendientes");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleApprove = async (payment: PendingPaymentItem) => {
    if (!window.confirm(`¿Aprobar pago de ${payment.tenantName} por $${payment.amount.toFixed(2)}?`)) {
      return;
    }
    setActionLoading(payment.id);
    try {
      await approvePayment(payment.tenantId);
      setPayments((prev) => prev.filter((p) => p.id !== payment.id));
      setTotal((prev) => prev - 1);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al aprobar pago");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectClick = (payment: PendingPaymentItem) => {
    setRejectModal({ open: true, payment });
    setRejectReason("");
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal.payment || !rejectReason.trim()) return;
    setActionLoading(rejectModal.payment.id);
    try {
      await rejectPayment(rejectModal.payment.tenantId, rejectReason.trim());
      setPayments((prev) => prev.filter((p) => p.id !== rejectModal.payment!.id));
      setTotal((prev) => prev - 1);
      setRejectModal({ open: false, payment: null });
      setRejectReason("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al rechazar pago");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <SuperAdminLayout>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0, marginBottom: 4 }}>
          Pagos pendientes
        </h2>
        <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
          Transferencias bancarias esperando aprobación
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 8,
            color: "#dc2626",
            fontSize: 14,
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "40vh",
          }}
        >
          <Loader2 size={32} className="login__spinner" style={{ color: "#3b82f6" }} />
        </div>
      ) : payments.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            backgroundColor: "#fff",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
          }}
        >
          <DollarSign size={48} style={{ margin: "0 auto 16px", color: "#94a3b8", opacity: 0.5 }} />
          <p style={{ color: "#64748b", fontSize: 16, margin: 0 }}>
            No hay pagos pendientes
          </p>
          <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 4 }}>
            Las transferencias bancarias aparecerán aquí cuando nuevos gimnasios se registren
          </p>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f8fafc",
                    color: "#64748b",
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  <th style={thStyle}>Negocio</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Plan</th>
                  <th style={thStyle}>Monto</th>
                  <th style={thStyle}>Referencia</th>
                  <th style={thStyle}>Fecha</th>
                  <th style={thStyle}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontWeight: 600, color: "#0f172a" }}>{p.tenantName}</span>
                        <button
                          onClick={() => navigate(`/super-admin/tenants/${p.tenantId}`)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#3b82f6",
                            display: "flex",
                            padding: 2,
                          }}
                          title="Ver tenant"
                        >
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, color: "#64748b" }}>{p.tenantEmail}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          backgroundColor: p.plan === "PREMIUM" ? "#f3e8ff" : "#dbeafe",
                          color: p.plan === "PREMIUM" ? "#7c3aed" : "#2563eb",
                        }}
                      >
                        {p.plan}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>${p.amount.toFixed(2)}</td>
                    <td style={{ ...tdStyle, color: "#64748b", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {p.reference || "—"}
                    </td>
                    <td style={tdStyle}>{new Date(p.createdAt).toLocaleDateString("es-ES")}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => handleApprove(p)}
                          disabled={actionLoading === p.id}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "6px 12px",
                            border: "1px solid #22c55e",
                            borderRadius: 6,
                            backgroundColor: "#fff",
                            color: "#22c55e",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {actionLoading === p.id ? (
                            <Loader2 size={14} className="login__spinner" />
                          ) : (
                            <CheckCircle size={14} />
                          )}
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleRejectClick(p)}
                          disabled={actionLoading === p.id}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "6px 12px",
                            border: "1px solid #ef4444",
                            borderRadius: 6,
                            backgroundColor: "#fff",
                            color: "#ef4444",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          <XCircle size={14} />
                          Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
                padding: "12px 20px",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{ ...pageBtnStyle, opacity: page <= 1 ? 0.5 : 1 }}
              >
                Anterior
              </button>
              <span style={{ fontSize: 14, color: "#64748b" }}>
                Página {page} de {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={{ ...pageBtnStyle, opacity: page >= totalPages ? 0.5 : 1 }}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setRejectModal({ open: false, payment: null })}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 24,
              width: "90%",
              maxWidth: 420,
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 8px", fontSize: 18, color: "#0f172a" }}>
              Rechazar pago
            </h3>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 16 }}>
              {rejectModal.payment?.tenantName} — ${rejectModal.payment?.amount.toFixed(2)}
            </p>
            <label style={{ display: "block", fontSize: 13, color: "#475569", marginBottom: 6, fontWeight: 600 }}>
              Motivo del rechazo
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ej: Comprobante ilegible, monto incorrecto..."
              style={{
                width: "100%",
                minHeight: 80,
                padding: 10,
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                fontSize: 14,
                fontFamily: "inherit",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
              <button
                onClick={() => setRejectModal({ open: false, payment: null })}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #cbd5e1",
                  borderRadius: 8,
                  backgroundColor: "#fff",
                  color: "#475569",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectReason.trim() || actionLoading !== null}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: 8,
                  backgroundColor: "#ef4444",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: rejectReason.trim() && actionLoading === null ? "pointer" : "not-allowed",
                  opacity: rejectReason.trim() && actionLoading === null ? 1 : 0.5,
                }}
              >
                {actionLoading === rejectModal.payment?.id ? (
                  <>
                    <Loader2 size={14} className="login__spinner" style={{ marginRight: 6 }} />
                    Rechazando...
                  </>
                ) : (
                  "Rechazar pago"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
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

const pageBtnStyle: React.CSSProperties = {
  padding: "6px 14px",
  border: "1px solid #cbd5e1",
  borderRadius: 6,
  backgroundColor: "#fff",
  color: "#475569",
  fontSize: 13,
  cursor: "pointer",
};

export default PendingPaymentsPage;
