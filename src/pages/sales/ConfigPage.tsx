/* Pagina de configuracion del negocio */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Building2, Percent, Clock } from "lucide-react";
import "../../styles/config.css";

interface ConfigData {
  businessName: string;
  businessRuc: string;
  businessAddress: string;
  taxRate: number;
  currency: string;
  openingHour: string;
  closingHour: string;
}

const defaultConfig: ConfigData = {
  businessName: "Gimnasio Fitness Pro",
  businessRuc: "1234567890001",
  businessAddress: "Av. Principal 123, Ciudad",
  taxRate: 12,
  currency: "USD",
  openingHour: "06:00",
  closingHour: "22:00",
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
          </div>
        </div>

        <div className="config-section">
          <div className="config-section__header">
            <Percent size={20} />
            <h3>Impuestos y Moneda</h3>
          </div>
          <div className="config-section__body">
            <div className="config-row">
              <div className="config-field">
                <label>IVA (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={config.taxRate}
                  onChange={(e) => handleChange("taxRate", Number(e.target.value))}
                />
              </div>
              <div className="config-field">
                <label>Moneda</label>
                <select
                  value={config.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                >
                  <option value="USD">USD - Dólar estadounidense</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="COP">COP - Peso colombiano</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="config-section">
          <div className="config-section__header">
            <Clock size={20} />
            <h3>Horarios</h3>
          </div>
          <div className="config-section__body">
            <div className="config-row">
              <div className="config-field">
                <label>Hora de Apertura</label>
                <input
                  type="time"
                  value={config.openingHour}
                  onChange={(e) => handleChange("openingHour", e.target.value)}
                />
              </div>
              <div className="config-field">
                <label>Hora de Cierre</label>
                <input
                  type="time"
                  value={config.closingHour}
                  onChange={(e) => handleChange("closingHour", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="config-actions">
          <button className="config-save-btn" onClick={handleSave}>
            <Save size={18} />
            {saved ? "¡Guardado!" : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </main>
  );
};

export default ConfigPage;
