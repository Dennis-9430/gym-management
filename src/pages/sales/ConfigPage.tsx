/* Pagina de configuracion del negocio */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Building2, MessageSquare, Lock, Crown } from "lucide-react";
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

interface OwnerData {
  firstName: string;
  lastName: string;
  email: string;
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
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultConfig;
    }
  }
  return defaultConfig;
};

const ConfigPage = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<ConfigData>(() => loadConfig());
  const [saved, setSaved] = useState(false);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const isPro = hasPlanFeature("whatsapp:write");
  const [ownerData, setOwnerData] = useState<OwnerData | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  // Cargar datos del owner
  useEffect(() => {
    const storedTenant = localStorage.getItem("tenant");
    const storedOwner = localStorage.getItem("ownerData");
    
    if (storedOwner) {
      try {
        setOwnerData(JSON.parse(storedOwner));
      } catch {
        // Ignorar error
      }
    }

    // Verificar si es cuenta demo
    if (storedTenant) {
      try {
        const tenant = JSON.parse(storedTenant);
        const demoEmails = ["demo-basic@gmail.com", "demo-pro@gmail.com"];
        setIsDemo(demoEmails.includes(tenant.email?.toLowerCase()));
      } catch {
        // Ignorar error
      }
    }
  }, []);

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
        {/* Sección Datos del Owner (solo lectura para demos) */}
        {ownerData && isDemo && (
          <div className="config-section">
            <div className="config-section__header">
              <Crown size={20} />
              <h3>Propietario (Owner)</h3>
            </div>
            <div className="config-section__body config-section__body--readonly">
              <div className="config-field">
                <label>Nombre</label>
                <input type="text" value={ownerData.firstName} disabled />
              </div>
              <div className="config-field">
                <label>Apellido</label>
                <input type="text" value={ownerData.lastName} disabled />
              </div>
              <div className="config-field">
                <label>Email</label>
                <input type="email" value={ownerData.email} disabled />
              </div>
            </div>
          </div>
        )}

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
