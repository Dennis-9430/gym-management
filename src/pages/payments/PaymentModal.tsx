import { useState } from "react";
import type { PaymentMethod, Service } from "../../types/payment.types";
import { services } from "../../types/payment.types";
import "../../styles/paymentModal.css";

interface Props {
  onClose: () => void;
}

const PaymentModal = ({ onClose }: Props) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [showServices, setShowServices] = useState(false);
  const [showMethods, setShowMethods] = useState(false);

  /* handles */

  const handleConfirm = () => {
    if (!selectedService) {
      alert("Complete todos los campos");
      return;
    }

    console.log("Pago registrado:", {
      service: selectedService.name,
      price: selectedService.price,
      method: paymentMethod,
      date: new Date(),
    });

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

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={stopPropagation}>
        <h2>Registrar Pago</h2>

        <form className="modal-form">
          {/* SERVICIOS */}
          <div className="form-group">
            <label>Servicio</label>

            <div className="custom-select">
              <button
                type="button"
                className="select-trigger"
                onClick={toggleServices}
              >
                {selectedService
                  ? `${selectedService.name} - $${selectedService.price}`
                  : "Selecciona un servicio"}
              </button>

              {showServices && (
                <ul className="select-dropdown">
                  {services.map((service) => (
                    <li
                      key={service.id}
                      onClick={() => handleSelectService(service)}
                    >
                      {service.name} - ${service.price}
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
              disabled={!selectedService}
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
