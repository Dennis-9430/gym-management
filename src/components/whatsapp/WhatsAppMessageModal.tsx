/* Modal para configurar mensajes automáticos de WhatsApp */
import { useState, useEffect } from "react";
import { X, MessageSquare, Calendar, Clock, Info } from "lucide-react";
import {
  getConfig,
  saveConfig,
  getSchedulerStatus,
  startScheduler,
} from "../../services/whatsapp.service";

type MessageType = "expiry" | "scheduled";

interface WhatsAppMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const defaultMessages = {
  expiry: "Hola {nombre}, de parte de {negocio}, tu membresía vence el {fecha}. ¡Te esperamos!",
  scheduled: "De parte de {negocio}, te deseas una feliz navidad 🎄",
};

const WhatsAppMessageModal = ({
  isOpen,
  onClose,
  onSaved,
}: WhatsAppMessageModalProps) => {
  const [messageType, setMessageType] = useState<MessageType>("expiry");
  const [message, setMessage] = useState(defaultMessages.expiry);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("20:00");
  const [expiryHour, setExpiryHour] = useState(20);
  const [loading, setLoading] = useState(false);
  const [schedulerRunning, setSchedulerRunning] = useState(false);
  const [errors, setErrors] = useState<{ date?: string; time?: string; message?: string }>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSaveError(null);
      setSaveSuccess(false);
      loadConfig();
    }
  }, [isOpen, messageType]);

  useEffect(() => {
    if (isOpen) {
      checkScheduler();
    }
  }, [isOpen]);

  const checkScheduler = async () => {
    try {
      const status = await getSchedulerStatus();
      setSchedulerRunning(status.running);
    } catch (err) {
      console.warn("Error al verificar scheduler:", err);
      setSchedulerRunning(false);
      // Falla silenciosa: el scheduler no es crítico para el modal.
    }
  };

  const loadConfig = async () => {
    try {
      const config = await getConfig(messageType);
      setMessage(config.message || defaultMessages[messageType]);
      setDate(config.scheduledDate || "");
      setTime(config.scheduledTime || "20:00");
      setExpiryHour(config.expiryHour || 20);
    } catch {
      setMessage(defaultMessages[messageType]);
    }
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!message.trim()) {
      newErrors.message = "El mensaje es requerido";
    }

    if (messageType === "scheduled") {
      if (!date) {
        newErrors.date = "La fecha es requerida";
      }
      if (!time) {
        newErrors.time = "La hora es requerida";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // VISUAL ONLY: flag demo local. Backend no usa este flag para permisos.
  const isDemo = localStorage.getItem("isDemo") === "true";

  const handleSave = async () => {
    if (!validate()) return;

    if (isDemo) {
      setSaveError("Las cuentas demo no pueden modificar esta configuración.");
      return;
    }

    setLoading(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const config = {
        type: messageType,
        message,
        scheduledDate: messageType === "scheduled" ? date : undefined,
        scheduledTime: messageType === "scheduled" ? time : undefined,
        expiryHour: messageType === "expiry" ? expiryHour : undefined,
        enabled: true,
      };

      await saveConfig(config);

      if (!schedulerRunning) {
        await startScheduler();
        setSchedulerRunning(true);
      }

      setSaveSuccess(true);
      setTimeout(() => {
        onSaved?.();
        onClose();
      }, 800);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Error al guardar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <MessageSquare size={20} />
            <h3>Notificaciones WhatsApp</h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="type-selector">
            <button
              className={`type-btn ${messageType === "expiry" ? "active" : ""}`}
              onClick={() => setMessageType("expiry")}
            >
              Vencimiento de membresía
            </button>
            <button
              className={`type-btn ${messageType === "scheduled" ? "active" : ""}`}
              onClick={() => setMessageType("scheduled")}
            >
              Promoción / Festivo
            </button>
          </div>

          {messageType === "expiry" && (
            <div className="info-box">
              <Info size={16} />
              <p>
                Este mensaje se enviará automáticamente todos los días a las {expiryHour}:00 a los
                clientes cuya membresía esté por vencer.
              </p>
            </div>
          )}

          {messageType === "scheduled" && (
            <div className="date-time-group">
              <div className="form-field">
                <label>
                  <Calendar size={14} />
                  Fecha
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={errors.date ? "error" : ""}
                />
                {errors.date && <span className="error-text">{errors.date}</span>}
              </div>
              <div className="form-field">
                <label>
                  <Clock size={14} />
                  Hora
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={errors.time ? "error" : ""}
                />
                {errors.time && <span className="error-text">{errors.time}</span>}
              </div>
            </div>
          )}

          <div className="form-field">
            <label>Mensaje</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              rows={4}
              className={errors.message ? "error" : ""}
            />
            {errors.message && <span className="error-text">{errors.message}</span>}
          </div>

          <div className="variables-hint">
            <span className="variables-label">Variables disponibles:</span>
            <div className="variables-chips">
              <span className="var-chip">{"{nombre}"}</span>
              <span className="var-chip">{"{fecha}"}</span>
              <span className="var-chip">{"{negocio}"}</span>
            </div>
          </div>

          {!schedulerRunning && (
            <div className="scheduler-warning">
              ⚠️ El scheduler está detenido. Se iniciarán los jobs al guardar.
            </div>
          )}

          {saveError && (
            <div className="error-box">
              {saveError}
            </div>
          )}

          {saveSuccess && (
            <div className="success-box">
              Configuración guardada correctamente
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={loading || isDemo}
          >
            {loading ? "Guardando..." : isDemo ? "No disponible en demo" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppMessageModal;