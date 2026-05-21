/* Lista de tenants con filtros para SUPER_ADMIN */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Eye,
  Ban,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { getAdminTenants, suspendTenant, cancelTenant } from "../../services/adminTenants.service";
import { TenantStatusBadge } from "../../components/superAdmin/TenantStatusBadge";
import type { AdminTenant } from "../../types/adminTenant.types";

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "ACTIVE", label: "Activo" },
  { value: "PENDING_PAYMENT", label: "Pendiente de pago" },
  { value: "EXPIRED", label: "Vencido" },
  { value: "SUSPENDED", label: "Suspendido" },
  { value: "CANCELLED", label: "Cancelado" },
];

const PLAN_OPTIONS = [
  { value: "", label: "Todos los planes" },
  { value: "BASIC", label: "BASIC" },
  { value: "PREMIUM", label: "PREMIUM" },
];

const PAGE_SIZE = 20;

const TenantListPage = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<AdminTenant[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getAdminTenants({
        status: statusFilter || undefined,
        plan: planFilter || undefined,
        search: debouncedSearch || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setTenants(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar tenants");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, planFilter, debouncedSearch, page]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSuspend = async (tenant: AdminTenant) => {
    const reason = window.prompt(`Motivo para suspender "${tenant.businessName}":`);
    if (reason === null) return;
    if (!reason.trim()) {
      alert("Debe ingresar un motivo para suspender el tenant.");
      return;
    }
    try {
      await suspendTenant(tenant.tenantId, reason.trim());
      fetchTenants();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al suspender tenant");
    }
  };

  const handleCancel = async (tenant: AdminTenant) => {
    const reason = window.prompt(`Motivo para cancelar "${tenant.businessName}":`);
    if (reason === null) return;
    if (!reason.trim()) {
      alert("Debe ingresar un motivo para cancelar el tenant.");
      return;
    }
    if (!window.confirm(`¿Está seguro de cancelar definitivamente "${tenant.businessName}"? Esta acción no se puede revertir.`)) {
      return;
    }
    try {
      await cancelTenant(tenant.tenantId, reason.trim());
      fetchTenants();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al cancelar tenant");
    }
  };

  return (
    <SuperAdminLayout>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>Tenants</h2>
          <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>
            {total} negocio{total !== 1 ? "s" : ""} registrado{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 320 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Buscar negocio, email o código..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 36px",
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Filter size={16} style={{ color: "#94a3b8" }} />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={selectStyle}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            value={planFilter}
            onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
            style={selectStyle}
          >
            {PLAN_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: "#fff", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px 20px" }}>
            <Loader2 size={24} className="login__spinner" style={{ color: "#3b82f6" }} />
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#dc2626" }}>
            <AlertTriangle size={32} style={{ margin: "0 auto 12px" }} />
            <p>{error}</p>
            <button onClick={fetchTenants} style={retryBtnStyle}>Reintentar</button>
          </div>
        ) : tenants.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
            <Building2Icon size={40} style={{ margin: "0 auto 12px" }} />
            <p>No se encontraron tenants</p>
          </div>
        ) : (
          <>
          <style>{`
            @media (max-width: 640px) {
              .sa-tenant-table,
              .sa-tenant-table tbody,
              .sa-tenant-table tr.sa-tenant-row {
                display: block;
                width: 100%;
              }
              .sa-tenant-table thead {
                display: none;
              }
              .sa-tenant-table tr.sa-tenant-row {
                background: #fff;
                border: 1px solid #e2e8f0;
                border-radius: 10px;
                padding: 16px;
                margin-bottom: 12px;
                box-shadow: 0 1px 2px rgba(0,0,0,0.05);
              }
              .sa-tenant-table tr.sa-tenant-row td {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 6px 0;
                border: none !important;
                font-size: 13px;
              }
              .sa-tenant-table tr.sa-tenant-row td::before {
                content: attr(data-label);
                font-weight: 600;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: #94a3b8;
                margin-right: 12px;
                flex-shrink: 0;
              }
              .sa-tenant-table tr.sa-tenant-row td[data-label="Acciones"]::before {
                align-self: flex-start;
              }
            }
          `}</style>
          <div style={{ overflowX: "auto" }}>
            <table className="sa-tenant-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", color: "#64748b", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={thStyle}>Negocio</th>
                  <th style={thStyle}>Código</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Plan</th>
                  <th style={thStyle}>Estado</th>
                  <th style={thStyle}>Vencimiento</th>
                  <th style={thStyle}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr key={t.id} className="sa-tenant-row" style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ""; }}
                  >
                    <td style={tdStyle} data-label="Negocio">
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>{t.businessName}</div>
                    </td>
                    <td style={{ ...tdStyle, color: "#64748b", fontFamily: "monospace", fontSize: 13 }} data-label="Código">{t.businessCode}</td>
                    <td style={tdStyle} data-label="Email">{t.email}</td>
                    <td style={tdStyle} data-label="Plan">
                      <span style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        backgroundColor: t.plan === "PREMIUM" ? "#f3e8ff" : "#dbeafe",
                        color: t.plan === "PREMIUM" ? "#7c3aed" : "#2563eb",
                      }}>
                        {t.plan}
                      </span>
                    </td>
                    <td style={tdStyle} data-label="Estado">
                      <TenantStatusBadge status={t.subscriptionStatus} />
                    </td>
                    <td style={{ ...tdStyle, color: "#64748b", fontSize: 13 }} data-label="Vencimiento">
                      {t.subscriptionEndDate
                        ? new Date(t.subscriptionEndDate).toLocaleDateString("es-ES")
                        : "—"}
                    </td>
                    <td style={tdStyle} data-label="Acciones">
                      <div style={{ display: "flex", gap: 6 }}>
                        <ActionBtn
                          icon={<Eye size={15} />}
                          label="Ver detalle"
                          onClick={() => navigate(`/super-admin/tenants/${t.tenantId}`)}
                          color="#3b82f6"
                        />
                        {t.subscriptionStatus !== "SUSPENDED" && t.subscriptionStatus !== "CANCELLED" && (
                          <>
                            <ActionBtn
                              icon={<Ban size={15} />}
                              label="Suspender"
                              onClick={() => handleSuspend(t)}
                              color="#eab308"
                            />
                            <ActionBtn
                              icon={<X size={15} />}
                              label="Cancelar"
                              onClick={() => handleCancel(t)}
                              color="#ef4444"
                            />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 20 }}>
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
    </SuperAdminLayout>
  );
};

/* Action button helper */
const ActionBtn = ({
  icon,
  label,
  onClick,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color: string;
}) => (
  <button
    onClick={onClick}
    title={label}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 32,
      height: 32,
      border: "1px solid #e2e8f0",
      borderRadius: 6,
      backgroundColor: "#fff",
      color,
      cursor: "pointer",
      transition: "all 0.15s",
    }}
  >
    {icon}
  </button>
);

/* Inline Building2 icon component to avoid conflict */
const Building2Icon = ({ size, style }: { size: number; style?: React.CSSProperties }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
    <path d="M10 6h4" />
    <path d="M10 10h4" />
    <path d="M10 14h4" />
    <path d="M10 18h4" />
  </svg>
);

/* Layout mínimo para páginas de SUPER_ADMIN */
import SuperAdminLayout from "../../components/superAdmin/SuperAdminLayout";

const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  textAlign: "left",
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  color: "#334155",
};

const selectStyle: React.CSSProperties = {
  padding: "8px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
  backgroundColor: "#fff",
  cursor: "pointer",
};

const pageBtnStyle: React.CSSProperties = {
  padding: "8px 16px",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  backgroundColor: "#fff",
  color: "#475569",
  fontSize: 14,
  cursor: "pointer",
};

const retryBtnStyle: React.CSSProperties = {
  marginTop: 12,
  padding: "8px 20px",
  border: "none",
  borderRadius: 8,
  backgroundColor: "#3b82f6",
  color: "#fff",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

export default TenantListPage;
