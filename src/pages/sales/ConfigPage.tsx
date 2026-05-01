/* Pagina de configuracion del negocio */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Building2, MessageSquare, Lock, CreditCard, Users, Calendar, RefreshCw } from "lucide-react";
import "../../styles/config.css";
import { hasPlanFeature } from "../../services/api";
import WhatsAppMessageModal from "../../components/whatsapp/WhatsAppMessageModal";

interface ConfigData {
  businessName: string;
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

const defaultConfig: ConfigData = {
  businessName: "Gimnasio Fitness Pro",
  businessRuc: "1234567890001",
  businessAddress: "Av. Principal 123, Ciudad",
  businessPhone: "",
  businessEmail: "",
};

const STORAGE_KEY = "gym-management.config";

const loadConfig = (): ConfigData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  let baseConfig = defaultConfig;
  
  if (stored) {
    try {
      baseConfig = { ...defaultConfig, ...JSON.parse(stored) };
    } catch {
      baseConfig = defaultConfig;
    }
  }
  
  const storedTenant = localStorage.getItem("tenant");
  if (storedTenant) {
    try {
      const tenant = JSON.parse(storedTenant);
      if (tenant.email) {
        baseConfig.businessEmail = tenant.email;
      }
      if (tenant.businessName) {
        baseConfig.businessName = tenant.businessName;
      }
    } catch {
      // Ignorar
    }
  }
  
  return baseConfig;
};

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
  const [config, setConfig] = useState<ConfigData>(() => loadConfig());
  const [saved, setSaved] = useState(false);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [renewing, setRenewing] = useState(false);
  const isPro = hasPlanFeature("whatsapp:write");

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const token = localStorage.getItem("token");
      const tenantId = localStorage.getItem("tenantId");
      if (!token || !tenantId) return;

      const res = await fetch(`/api/tenants/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSubscription({
          plan: data.plan || "BASIC",
          subscriptionStatus: data.subscriptionStatus || "ACTIVE",
          subscriptionEndDate: data.subscriptionEndDate || null,
          users: { current: 1, max: data.plan === "PREMIUM" ? 6 : 1 },
        });
      }
    } catch {
      // Error silencioso
    }
  };

  const handleRenew = async () => {
    try {
      setRenewing(true);
      const token = localStorage.getItem("token");
      const tenantId = localStorage.getItem("tenantId");
      if (!token || !tenantId) return;

      const res = await fetch(`/api/tenants/renew`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tenantId }),
      });
      if (res.ok) {
        await loadSubscription();
      }
    } catch {
      // Error silencioso
    } finally {
      setRenewing(false);
    }
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (field: keyof ConfigData, value: string | number) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
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

      <section className="config-section__body">
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
              disabled
            />
          </div>

          <div className="config-field">
            <label>Correo Electrónico</label>
            <input
              type="email"
              value={config.businessEmail}
              onChange={(e) => handleChange("businessEmail", e.target.value)}
              disabled
            />
          </div>

          <div className="config-field">
            <label>RUC / Identificación</label>
            <input
              type="text"
              value={config.businessRuc}
              onChange={(e) => handleChange("businessRuc", e.target.value)}
              placeholder="Ingrese RUC o identificación"
            />
          </div>

          <div className="config-field">
            <label>Teléfono</label>
            <input
              type="tel"
              value={config.businessPhone}
              onChange={(e) => handleChange("businessPhone", e.target.value)}
              placeholder="+51 999 999 999"
            />
          </div>

          <div className="config-field config-field--full">
            <label>Dirección</label>
            <input
              type="text"
              value={config.businessAddress}
              onChange={(e) => handleChange("businessAddress", e.target.value)}
              placeholder="Dirección del gimnasio"
            />
          </div>
        </div>

        <div className="config-actions">
          <button className="config-save-btn" onClick={handleSave}>
            <Save size={18} />
            Guardar Cambios
          </button>
          {saved && <span className="config-saved">¡Guardado exitosamente!</span>}
        </div>
      </section>

      {isPro && (
        <section className="config-section__body">
          <div className="config-section__header">
            <MessageSquare size={20} />
            <h3>WhatsApp</h3>
          </div>
          <p className="config-description">
            Envía recordatorios automáticos de vencimiento de membresías a tus clientes.
          </p>
          <button className="config-whatsapp-btn" onClick={() => setWhatsAppModalOpen(true)}>
            <MessageSquare size={18} />
            Configurar WhatsApp
          </button>
        </section>
      )}

      {!isPro && (
        <section className="config-section__body">
          <div className="config-section__header">
            <Lock size={20} />
            <h3>WhatsApp</h3>
          </div>
          <p className="config-description">
            Disponible en plan PREMIUM. Actualiza tu plan para acceder a esta función.
          </p>
        </section>
      )}

      <WhatsAppMessageModal
        isOpen={whatsAppModalOpen}
        onClose={() => setWhatsAppModalOpen(false)}
      />
    </main>
  );
};

export default ConfigPage;