import {
  ClipboardList,
  CreditCard,
  Search,
  UserRound,
  X,
} from "lucide-react";
import type { ClientForm } from "../../types/client.types";
import type { Service } from "../../types/payment.types";
import type { PaymentMethod } from "../../types/sales.types";
import { services } from "../../types/payment.types";
import { parseDecimal } from "../../utils/format/number";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;

  // Client
  search: string;
  onSearchChange: (value: string) => void;
  clientResults: ClientForm[];
  onSelectClient: (client: ClientForm) => void;
  selectedClient: ClientForm | null;

  // Service
  selectedService: Service | null;
  showServices: boolean;
  onToggleServices: () => void;
  onSelectService: (service: Service) => void;

  // Date
  startDate: string;
  onStartDateChange: (value: string) => void;

  // Payment
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  cashAmount: number;
  transferAmount: number;
  onCashChange: (value: number) => void;
  onTransferChange: (value: number) => void;

  // Discount
  discountPercent: number;
  discountUsd: number;
  total: number;
  paidValue: number;
  change: number;
  onDiscountPercentChange: (value: number) => void;
  onDiscountUsdChange: (value: number) => void;
  onPaidChange: (value: number) => void;

  // Actions
  onRegister: () => void;
  onPending: () => void;
}

const SubscriptionModal = ({
  isOpen,
  onClose,
  search,
  onSearchChange,
  clientResults,
  onSelectClient,
  selectedClient,
  selectedService,
  showServices,
  onToggleServices,
  onSelectService,
  startDate,
  onStartDateChange,
  paymentMethod,
  onPaymentMethodChange,
  cashAmount,
  transferAmount,
  onCashChange,
  onTransferChange,
  discountPercent,
  discountUsd,
  total,
  paidValue,
  change,
  onDiscountPercentChange,
  onDiscountUsdChange,
  onPaidChange,
  onRegister,
  onPending,
}: SubscriptionModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="pos-modal-backdrop" onClick={onClose}>
      <div
        className="pos-modal pos-modal-sm"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pos-modal-header">
          <div>
            <h3>Registrar suscripcion</h3>
            <p>Busca un cliente y configura la suscripcion.</p>
          </div>
          <button type="button" className="pos-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="pos-modal-body">
          {/* Cliente */}
          <div className="pos-section">
            <div className="pos-section-title">
              <UserRound size={18} />
              <h4>Cliente</h4>
            </div>
            <div 
              className="pos-search-wrapper"
              style={{ marginBottom: (search.trim().length > 0 || selectedClient) ? '20px' : '0' }}
            >
              <div className="pos-search">
                <Search size={16} />
                <input
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Buscar por cedula o nombre"
                />
              </div>
              {search.trim().length > 0 && (
                <ul className="pos-search-dropdown">
                  {clientResults.length > 0 ? (
                    clientResults.map((client) => (
                      <li key={client.id}>
                        <button
                          type="button"
                          onClick={() => onSelectClient(client)}
                        >
                          <span className="pos-suggestion-title">
                            {client.firstName} {client.lastName} 
                            <span className="sep">|</span> {client.email}
                            <span className="sep">|</span> {client.phone}
                            <span className="sep">|</span> {client.address}
                          </span>
                          <span className="pos-suggestion-meta">
                            <span className="sep-right">Cedula:</span> {client.documentNumber}
                          </span>
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="pos-suggestion-empty">Sin coincidencias</li>
                  )}
                </ul>
              )}
            </div>
          </div>

          {/* Suscripcion */}
          <div className="pos-section">
            <div className="pos-section-title">
              <ClipboardList size={18} />
              <h4>Suscripcion</h4>
            </div>
            <div className="pos-two-col">
              <div className="pos-field">
                <label>Tipo de suscripcion</label>
                <div className="pos-select">
                  <button
                    type="button"
                    className="pos-select-trigger"
                    onClick={onToggleServices}
                  >
                    {selectedService
                      ? `${selectedService.name} - $${selectedService.price}`
                      : "Selecciona un servicio"}
                  </button>
                  {showServices && (
                    <ul className="pos-select-dropdown">
                      {services.map((service) => (
                        <li
                          key={service.id}
                          onClick={() => onSelectService(service)}
                        >
                          {service.name} - $${service.price}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="pos-field">
                <label>Fecha de inicio</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onStartDateChange(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Metodo de pago */}
          <div className="pos-section">
            <div className="pos-section-title">
              <CreditCard size={18} />
              <h4>Metodo de pago</h4>
            </div>
            <div className="pos-field">
              <label>Metodo de pago</label>
              <select
                value={paymentMethod}
                onChange={(e) =>
                  onPaymentMethodChange(e.target.value as PaymentMethod)
                }
              >
                <option value="CASH">Efectivo</option>
                <option value="TRANSFER">Transferencia</option>
                <option value="MIXED">Mixto</option>
              </select>
            </div>

            {paymentMethod === "MIXED" && (
              <div className="pos-payment-grid">
                <div className="pos-field">
                  <label>Efectivo</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={cashAmount}
                    onChange={(e) =>
                      onCashChange(parseDecimal(e.target.value))
                    }
                  />
                </div>
                <div className="pos-field">
                  <label>Transferencia</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={transferAmount}
                    onChange={(e) =>
                      onTransferChange(parseDecimal(e.target.value))
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Descuentos y totales */}
          <div className="pos-section">
            <div className="pos-two-col">
              <div className="pos-field">
                <label>Descuento especial (%)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={discountPercent}
                  onChange={(e) =>
                    onDiscountPercentChange(parseDecimal(e.target.value))
                  }
                />
              </div>
              <div className="pos-field">
                <label>Descuento especial USD</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={discountUsd}
                  onChange={(e) =>
                    onDiscountUsdChange(parseDecimal(e.target.value))
                  }
                />
              </div>
            </div>
            <div className="pos-two-col">
              <div className="pos-field">
                <label>Total</label>
                <input type="text" value={total} readOnly />
              </div>
              <div className="pos-field">
                <label>Pagado</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={paidValue}
                  onChange={(e) => onPaidChange(parseDecimal(e.target.value))}
                  readOnly={paymentMethod === "MIXED"}
                />
              </div>
            </div>
            <div className="pos-field">
              <label>Cambio</label>
              <input type="text" value={change} readOnly />
            </div>
          </div>

          {/* Acciones */}
          <div className="pos-modal-actions">
            <button
              type="button"
              className="pos-checkout-btn"
              onClick={onRegister}
            >
              Registrar suscripcion
            </button>
            <button
              type="button"
              className="pos-pending-btn"
              onClick={onPending}
            >
              Pendiente
            </button>
            <button
              type="button"
              className="pos-cancel-btn"
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
