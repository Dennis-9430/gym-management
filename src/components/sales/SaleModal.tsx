import {
  CreditCard,
  Search,
  ShoppingCart,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import CartTable from "../pos/CartTable";
import type { ClientForm } from "../../types/client.types";
import type { CatalogItem, CartItem, CartTotals } from "../../types/pos.types";
import type { PaymentMethod } from "../../types/sales.types";
import { parseDecimal } from "../../utils/format/number";

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  
  // Client
  clientInput: string;
  onClientInputChange: (value: string) => void;
  clientResults: ClientForm[];
  selectedClient: ClientForm | null;
  onSelectClient: (client: ClientForm) => void;
  onSelectConsumerFinal: () => void;
  
  // Payment
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  cashAmount: number;
  transferAmount: number;
  voucherCode: string;
  onCashChange: (value: number) => void;
  onTransferChange: (value: number) => void;
  onVoucherChange: (value: string) => void;
  
  // Cart
  search: string;
  onSearchChange: (value: string) => void;
  filteredCatalog: CatalogItem[];
  onAddItem: (item: CatalogItem) => void;
  items: CartItem[];
  taxRate: number;
  onQtyChange: (key: string, quantity: number) => void;
  onDiscountChange: (key: string, discount: number) => void;
  onRemoveItem: (key: string) => void;
  onClearCart: () => void;
  totals: CartTotals;
  
  // Summary
  discountPercent: number;
  taxPercent: number;
  isAdmin: boolean;
  onDiscountRateChange: (value: number) => void;
  onTaxRateChange: (value: number) => void;
  onCheckout: () => void;
}

const SaleModal = ({
  isOpen,
  onClose,
  clientInput,
  onClientInputChange,
  clientResults,
  selectedClient,
  onSelectClient,
  onSelectConsumerFinal,
  paymentMethod,
  onPaymentMethodChange,
  cashAmount,
  transferAmount,
  voucherCode,
  onCashChange,
  onTransferChange,
  onVoucherChange,
  search,
  onSearchChange,
  filteredCatalog,
  onAddItem,
  items,
  taxRate,
  onQtyChange,
  onDiscountChange,
  onRemoveItem,
  onClearCart,
  totals,
  discountPercent,
  taxPercent,
  isAdmin,
  onDiscountRateChange,
  onTaxRateChange,
  onCheckout,
}: SaleModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="pos-modal-backdrop" onClick={onClose}>
      <div className="pos-modal" onClick={(event) => event.stopPropagation()}>
        <div className="pos-modal-header">
          <div>
            <h3>Agregar venta</h3>
            <p>Completa la informacion para registrar la venta.</p>
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
                className="pos-client-actions"
                style={{ marginBottom: (clientInput.trim().length > 0 || selectedClient) ? '20px' : '0' }}
              >
                <div className="pos-search-wrapper">
                  <div className="pos-search">
                    <Search size={16} />
                  <input
                    value={clientInput}
                    onChange={(e) => onClientInputChange(e.target.value)}
                    placeholder="Buscar por cedula o nombre"
                    disabled={!!selectedClient}
                  />
                  </div>
                  {clientInput.trim().length > 0 && clientInput.trim() !== "99999999" && !selectedClient && (
                    <ul className="pos-search-dropdown">
                      {clientResults.length > 0 ? (
                        clientResults.map((client) => (
                          <li key={client.id}>
                            <button type="button" onClick={() => onSelectClient(client)}>
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
                {!selectedClient && (
                  <button
                    type="button"
                    className="pos-consumer-btn"
                    onClick={() => {
                      onSelectConsumerFinal();
                      onClientInputChange("99999999");
                    }}
                  >
                    Consumidor final
                  </button>
                )}
              </div>
              {selectedClient && (
                <div className="pos-client-card" style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong>{selectedClient.firstName} {selectedClient.lastName}</strong>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                    <div>Cedula:<br/><strong style={{color: '#0f172a'}}>{selectedClient.documentNumber}</strong></div>
                    {selectedClient.address && <div>Direccion:<br/><strong style={{color: '#0f172a'}}>{selectedClient.address}</strong></div>}
                    {selectedClient.email && <div>Email:<br/><strong style={{color: '#0f172a'}}>{selectedClient.email}</strong></div>}
                    {selectedClient.phone && <div>Telefono:<br/><strong style={{color: '#0f172a'}}>{selectedClient.phone}</strong></div>}
                  </div>
                </div>
              )}
            </div>

          {/* Pago */}
          <div className="pos-section">
            <div className="pos-section-title">
              <CreditCard size={18} />
              <h4>Pago</h4>
            </div>
            <div className="pos-field">
              <label>Metodo de pago</label>
              <select
                value={paymentMethod}
                onChange={(e) => onPaymentMethodChange(e.target.value as PaymentMethod)}
              >
                <option value="CASH">Efectivo</option>
                <option value="TRANSFER">Transferencia</option>
                <option value="MIXED">Mixto</option>
              </select>
            </div>

            {paymentMethod === "MIXED" ? (
              <div className="pos-payment-grid">
                <div className="pos-field">
                  <label>Efectivo</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={cashAmount}
                    onChange={(e) => onCashChange(parseDecimal(e.target.value))}
                  />
                </div>
                <div className="pos-field">
                  <label>Transferencia</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={transferAmount}
                    onChange={(e) => onTransferChange(parseDecimal(e.target.value))}
                  />
                </div>
              </div>
            ) : (
              <div className="pos-field">
                <label>Monto</label>
                <input type="text" value={totals.total} readOnly />
              </div>
            )}

            <div className="pos-field">
              <label>Voucher</label>
              <input
                value={voucherCode}
                onChange={(e) => onVoucherChange(e.target.value)}
                placeholder="Codigo de voucher"
              />
            </div>
          </div>

          {/* Carrito */}
          <div className="pos-section pos-cart-section">
            <div className="pos-cart-header">
              <div className="pos-cart-title">
                <Search size={18} />
                <h3>Buscar productos y servicios</h3>
              </div>
              <button type="button" className="pos-clear-btn" onClick={onClearCart}>
                <Trash2 size={16} />
                Limpiar
              </button>
            </div>

            <div className="pos-search-wrapper">
              <div className="pos-search">
                <ShoppingCart size={16} />
                <input
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Buscar productos o servicios"
                />
              </div>
              {search.trim().length > 0 && (
                <ul className="pos-search-dropdown">
                  {filteredCatalog.length > 0 ? (
                    filteredCatalog.map((item) => (
                      <li key={item.key}>
                        <button type="button" onClick={() => { onAddItem(item); onSearchChange(""); }}>
                          <span className="pos-suggestion-title">{item.name}</span>
                          <span className="pos-suggestion-meta">
                            {item.category} - ${item.unitPrice.toFixed(2)}
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

            <div className="pos-cart-table-wrapper">
              <CartTable
                items={items}
                taxRate={taxRate}
                onQtyChange={onQtyChange}
                onDiscountChange={onDiscountChange}
                onRemove={onRemoveItem}
              />
            </div>
          </div>

          {/* Resumen */}
          <div className="pos-summary">
            <div className="pos-summary-row">
              <span>Subtotal</span>
              <strong>${totals.subtotal.toFixed(2)}</strong>
            </div>
            <div className="pos-summary-row">
              <span>Subtotal por impuesto</span>
              <strong>${totals.taxableSubtotal.toFixed(2)}</strong>
            </div>
            <div className="pos-summary-row">
              <span>Subtotal IVA {taxPercent}%</span>
              <strong>${totals.vatSubtotal.toFixed(2)}</strong>
            </div>
            <div className="pos-summary-row">
              <span>Descuento</span>
              <div className="pos-summary-inline">
                {isAdmin ? (
                  <div className="pos-rate-input">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={discountPercent}
                      onChange={(e) =>
                        onDiscountRateChange(parseDecimal(e.target.value))
                      }
                    />
                    <span>%</span>
                  </div>
                ) : (
                  <span>{discountPercent}%</span>
                )}
                <strong>-${totals.discountAmount.toFixed(2)}</strong>
              </div>
            </div>
            <div className="pos-summary-row">
              <span>ICE</span>
              <strong>${totals.iceAmount.toFixed(2)}</strong>
            </div>
            <div className="pos-summary-row">
              <span>IVA</span>
              <div className="pos-summary-inline">
                {isAdmin ? (
                  <div className="pos-rate-input">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={taxPercent}
                      onChange={(e) => onTaxRateChange(parseDecimal(e.target.value))}
                    />
                    <span>%</span>
                  </div>
                ) : (
                  <span>{taxPercent}%</span>
                )}
                <strong>${totals.taxAmount.toFixed(2)}</strong>
              </div>
            </div>
            <div className="pos-summary-total">
              <span>Total</span>
              <strong>${totals.total.toFixed(2)}</strong>
            </div>
            <div className="pos-summary-actions">
              <button type="button" className="pos-checkout-btn" onClick={onCheckout}>
                Registrar venta
              </button>
              <button type="button" className="pos-cancel-btn" onClick={onClose}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleModal;
