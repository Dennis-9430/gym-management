/* Pagina de configuracion del negocio */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Building2, MessageSquare, Lock } from "lucide-react";
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
  
  // Cargar email del owner/tenant para demos
  const storedTenant = localStorage.getItem("tenant");
  if (storedTenant) {
    try {
      const tenant = JSON.parse(storedTenant);
      if (tenant.email) {
        baseConfig.businessEmail = tenant.email;
      }
    } catch {
      // Ignorar
    }
  }
  
  return baseConfig;
};

const ConfigPage = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<ConfigData>(() => loadConfig());
  const [saved, setSaved] = useState(false);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const isPro = hasPlanFeature("whatsapp:write");

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (field: keyof ConfigData, value: string | number) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <main className="config-page">
      <div className="config-header">
        <button className="btn-back" onClick={() => navigate("/sales")}>
          <ArrowLeft size={20} />
          Volver
        </button>
        <h2 className="config-title">Configuración</h2>
        <p className="config-subtitle">Administra los datos del negocio</p>
      </div>

      <div className="config-content">
        <div className="config-section">
          <div className="config-section__header">
            <Building2 size={20} />
            <h3>Datos del Negocio</h3>
          </div>
          <div className="config-section__body">
            <div className="config-field">
              <label>Nombre del Negocio</label>
              <input
                type="text"
                value={config.businessName}
                onChange={(e) => handleChange("businessName", e.target.value)}
                placeholder="Nombre de tu gimnasio"
              />
            </div>
            <div className="config-field">
              <label>RUC / Cédula</label>
              <input
                type="text"
                value={config.businessRuc}
                onChange={(e) => handleChange("businessRuc", e.target.value)}
                placeholder="Número de identificación fiscal"
              />
            </div>
            <div className="config-field">
              <label>Dirección</label>
              <input
                type="text"
                value={config.businessAddress}
                onChange={(e) => handleChange("businessAddress", e.target.value)}
                placeholder="Dirección del negocio"
              />
            </div>
            <div className="config-field">
              <label>Teléfono</label>
              <input
                type="tel"
                value={config.businessPhone}
                onChange={(e) => handleChange("businessPhone", e.target.value)}
                placeholder="Número de teléfono"
              />
            </div>
            <div className="config-field">
              <label>Email</label>
              <input
                type="email"
                value={config.businessEmail}
                onChange={(e) => handleChange("businessEmail", e.target.value)}
                placeholder="correo@ejemplo.com"
                disabled={!!config.businessEmail}
              />
            </div>
          </div>
        </div>

        <div className="config-section">
          <div className="config-section__header">
            <MessageSquare size={20} />
            <h3>Notificaciones WhatsApp</h3>
          </div>
          <div className="config-section__body">
            {isPro ? (
              <button
                className="whatsapp-config-btn"
                onClick={() => setWhatsAppModalOpen(true)}
              >
                <MessageSquare size={18} />
                Configurar mensajes automáticos
              </button>
            ) : (
              <div className="pro-feature-locked">
                <Lock size={16} />
                <p>Configurar mensajes automáticos</p>
                <span className="pro-badge">PRO</span>
              </div>
            )}
          </div>
        </div>

        <div className="config-actions">
          <button className="config-save-btn" onClick={handleSave}>
            <Save size={18} />
            {saved ? "¡Guardado!" : "Guardar Cambios"}
          </button>
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
