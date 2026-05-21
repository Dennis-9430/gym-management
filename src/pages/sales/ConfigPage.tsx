/* Página de configuración del negocio — fuente de verdad: backend */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Building2, MessageSquare, CreditCard, Users, Calendar, RefreshCw } from "lucide-react";
import "../../styles/config.css";
import { apiGet, apiPost, apiPut } from "../../services/api";
import { useAccountType } from "../../hooks/useAccountType";
import WhatsAppMessageModal from "../../components/whatsapp/WhatsAppMessageModal";

interface ConfigData {
  businessName: string;
  businessCode: string;
  businessRuc: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
}

interface SubscriptionInfo {
  plan: string;
  subscriptionStatus: string;
  subscriptionEndDate: string | null;
  users: { current: number; max: number };
}

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return "Sin límite";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const ConfigPage = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [renewing, setRenewing] = useState(false);
  const { isDemo, ownerEditableFields } = useAccountType();

  useEffect(() => {
    loadTenantData();
  }, []);

  const loadTenantData = async () => {
    setLoading(true);
    try {
      const data = await apiGet("/api/tenants/me");
      setConfig({
        businessName: data.businessName || "",
        businessCode: data.businessCode || "",
        businessRuc: data.businessRuc || "",
        businessAddress: data.businessAddress || "",
        businessPhone: data.businessPhone || "",
        businessEmail: data.email || "",
      });
      setSubscription({
        plan: data.plan || "BASIC",
        subscriptionStatus: data.subscriptionStatus || "ACTIVE",
        subscriptionEndDate: data.subscriptionEndDate || null,
        users: { current: 1, max: data.plan === "PREMIUM" ? 6 : 1 },
      });
    } catch (err) {
      console.warn("Error al cargar datos del negocio:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async () => {
    if (isDemo) {
      alert("Las cuentas demo tienen acceso restringido.");
      return;
    }
    try {
      setRenewing(true);
      await apiPost("/api/tenants/renew", {});
      await loadTenantData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al renovar suscripción. Intenta de nuevo más tarde.");
    } finally {
      setRenewing(false);
    }
  };

  const handleSave = async () => {
    if (isDemo || !config) {
      alert("Las cuentas demo tienen acceso restringido.");
      return;
    }
    try {
      setSaving(true);
      // Enviar solo campos editables al backend
      await apiPut("/api/tenants/me", {
        businessName: config.businessName,
        businessPhone: config.businessPhone,
        businessAddress: config.businessAddress,
        businessRuc: config.businessRuc,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof ConfigData, value: string | number) => {
    if (isDemo || !config) return;
    if (field === "businessEmail" && !ownerEditableFields.email) return;
    if (field === "businessName" && !ownerEditableFields.businessName) return;
    setConfig((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const getStatusLabel = (status: string): string => {
    const map: Record<string, string> = {
      ACTIVE: "ACTIVO",
      PENDING: "PENDIENTE",
      EXPIRED: "EXPIRADO",
    };
    return map[status] || status;
  };

  const getStatusClass = (status: string): string => {
    if (status === "ACTIVE") return "status--active";
    if (status === "EXPIRED") return "status--expired";
    return "status--pending";
  };

  if (loading) {
    return (
      <main className="config-page">
        <p className="config-loading">Cargando configuración...</p>
      </main>
    );
  }

  if (!config) {
    return (
      <main className="config-page">
        <p className="config-loading">No se pudieron cargar los datos del negocio.</p>
      </main>
    );
  }

  return (
    <main className="config-page">
      <header className="config-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Volver
        </button>
        <h1 className="config-title">Configuración</h1>
        <p className="config-subtitle">Administra la información de tu gimnasio</p>
      </header>

      <div className="config-layout">
        <div className="config-layout-row">
          {/* Columna izquierda: Datos del Negocio */}
          <div className="config-layout-col">
            <section className="config-section__body">
              <div className="config-section__header">
                <Building2 size={20} />
                <h3>Datos del Negocio</h3>
              </div>

              <div className="config-grid">
                <div className="config-field">
                  <label>Nombre del Negocio</label>
                  <input
                    type="text"
                    value={config.businessName}
                    onChange={(e) => handleChange("businessName", e.target.value)}
                    disabled={isDemo || !ownerEditableFields.businessName}
                  />
                  {!ownerEditableFields.businessName && !isDemo && (
                    <span className="field-hint">No editable (dato del registro)</span>
                  )}
                </div>

                <div className="config-field">
                  <label>Código del Negocio</label>
                  <div className="config-businesscode">
                    <input
                      type="text"
                      value={config.businessCode}
                      readOnly
                      className="businesscode-input"
                      title="Este código lo usás para iniciar sesión. No se puede editar."
                    />
                    <span className="field-hint">
                      Usá este código en el login como <strong>Código del Negocio</strong>
                    </span>
                  </div>
                </div>

                <div className="config-field">
                  <label>Correo Electrónico</label>
                  <input
                    type="email"
                    value={config.businessEmail}
                    onChange={(e) => handleChange("businessEmail", e.target.value)}
                    disabled={isDemo || !ownerEditableFields.email}
                  />
                  {!ownerEditableFields.email && !isDemo && (
                    <span className="field-hint">No editable (dato del registro)</span>
                  )}
                </div>

                <div className="config-field">
                  <label>RUC / Identificación</label>
                  <input
                    type="text"
                    value={config.businessRuc}
                    onChange={(e) => handleChange("businessRuc", e.target.value)}
                    placeholder="Ingrese RUC o identificación"
                    disabled={isDemo}
                  />
                </div>

                <div className="config-field">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={config.businessPhone}
                    onChange={(e) => handleChange("businessPhone", e.target.value)}
                    placeholder="+51 999 999 999"
                    disabled={isDemo}
                  />
                </div>

                <div className="config-field config-field--full">
                  <label>Dirección</label>
                  <input
                    type="text"
                    value={config.businessAddress}
                    onChange={(e) => handleChange("businessAddress", e.target.value)}
                    placeholder="Dirección del gimnasio"
                    disabled={isDemo}
                  />
                </div>
              </div>

              <div className="config-actions">
                <button className="config-save-btn" onClick={handleSave} disabled={saving}>
                  <Save size={18} />
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </button>
                {saved && <span className="config-saved">¡Guardado exitosamente!</span>}
                {isDemo && <span className="config-actions__demo-hint">Demo — solo vista previa</span>}
              </div>
            </section>
          </div>

          {/* Columna derecha: Suscripción + WhatsApp */}
          <div className="config-layout-col">
            <section className="config-section__body config-section--subscription">
              <div className="config-section__header">
                <CreditCard size={20} />
                <h3>Suscripción</h3>
              </div>

              {subscription ? (
                <div className="subscription-info">
                  <div className="subscription-grid">
                    <div className="subscription-item">
                      <span className="subscription-label">Plan</span>
                      <span className="subscription-value">{subscription.plan}</span>
                    </div>
                    <div className="subscription-item">
                      <span className="subscription-label">Estado</span>
                      <span className={`subscription-status ${getStatusClass(subscription.subscriptionStatus)}`}>
                        {getStatusLabel(subscription.subscriptionStatus)}
                      </span>
                    </div>
                    <div className="subscription-item">
                      <span className="subscription-label">Vence</span>
                      <span className="subscription-value">
                        <Calendar size={14} />
                        {formatDate(subscription.subscriptionEndDate)}
                      </span>
                    </div>
                    <div className="subscription-item">
                      <span className="subscription-label">Usuarios</span>
                      <span className="subscription-value">
                        <Users size={14} />
                        {subscription.users.current}/{subscription.users.max}
                      </span>
                    </div>
                  </div>

                  <button
                    className="config-renew-btn"
                    onClick={handleRenew}
                    disabled={renewing}
                  >
                    <RefreshCw size={16} className={renewing ? "spin" : ""} />
                    {renewing ? "Renovando..." : "Renovar 30 días"}
                  </button>
                </div>
              ) : (
                <p className="config-loading">Cargando...</p>
              )}
            </section>

            <section className="config-section__body config-section--whatsapp">
              <div className="config-section__header">
                <MessageSquare size={20} />
                <h3>WhatsApp</h3>
                {isDemo && <span className="demo-badge">Demo</span>}
              </div>
              <p className="config-description">
                Envía recordatorios automáticos de vencimiento de membresías a tus clientes.
              </p>
              <button className="config-whatsapp-btn" onClick={() => setWhatsAppModalOpen(true)}>
                <MessageSquare size={18} />
                Configurar WhatsApp
              </button>
            </section>
          </div>
        </div>
      </div>

      <WhatsAppMessageModal
        isOpen={whatsAppModalOpen}
        onClose={() => setWhatsAppModalOpen(false)}
      />
    </main>
  );
};

export default ConfigPage;
