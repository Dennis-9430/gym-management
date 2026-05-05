import { useState, useEffect } from "react";
import type { PaymentMethod, Service } from "../../types/payment.types";
import { getDailyServices } from "../../services/services.service";
import "../../styles/paymentModal.css";

/* Modal para registrar pagos diarios */
interface Props {
  onClose: () => void;
}

const PaymentModal = ({ onClose }: Props) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showServices, setShowServices] = useState(false);
  const [showMethods, setShowMethods] = useState(false);
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Carga servicios diarios ($1-$5) desde MongoDB al abrir el modal
  useEffect(() => {
    getDailyServices()
      .then((data) => {
        setServicesList(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  /* handles */

  const handleConfirm = () => {
    if (!selectedService) {
      alert("Complete todos los campos");
      return;
    }

    onClose();
  };

  const toggleServices = () => {
    setShowServices((prev) => !prev);
  };

  const toggleMethods = () => {
    setShowMethods((prev) => !prev);
  };

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setShowServices(false);
  };

  const handleSelectMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setShowMethods(false);
  };

  const stopPropagation = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className="modal-backdrop">
      <div className="modal-content" onClick={stopPropagation}>
        <div className="modal-header">
          <h2>Registrar Pago Diario</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="modal-form">
          {/* SERVICIOS */}
          <div className="form-group">
            <label>Servicio</label>

            <div className="custom-select">
              <button
                type="button"
                className="select-trigger"
                onClick={toggleServices}
                disabled={loading}
              >
                {loading
                  ? "Cargando..."
                  : selectedService
                    ? `${selectedService.name} - $${Number(selectedService.price).toFixed(2)}`
                    : "Selecciona un servicio"}
              </button>

              {showServices && (
                <ul className="select-dropdown">
                  {servicesList.length === 0 && !loading && (
                    <li className="no-results">No hay servicios disponibles</li>
                  )}
                  {servicesList.map((service) => (
                    <li
                      key={service.id}
                      onClick={() => handleSelectService(service)}
                    >
                      {service.name} - ${Number(service.price).toFixed(2)}
                      {service.duration && (
                        <span className="service-duration">
                          ({service.duration} {service.durationUnit})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* MÉTODO DE PAGO */}
          <div className="form-group">
            <label>Método de Pago</label>

            <div className="custom-select">
              <button
                type="button"
                className="select-trigger"
                onClick={toggleMethods}
              >
                {paymentMethod === null
                  ? "Selecciona un método"
                  : paymentMethod === "CASH"
                    ? "Efectivo"
                    : "Transferencia"}
              </button>

              {showMethods && (
                <ul className="select-dropdown">
                  <li onClick={() => handleSelectMethod("CASH")}>Efectivo</li>
                  <li onClick={() => handleSelectMethod("TRANSFER")}>
                    Transferencia
                  </li>
                </ul>
              )}
            </div>
          </div>

          {/* BOTONES */}
          <div className="modal-actions">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedService || !paymentMethod}
              className="btn-primary"
            >
              Confirmar Pago
            </button>

            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
