import { useEffect, useMemo, useState } from "react";
import { Search, ShoppingCart, Trash2, UserRound } from "lucide-react";
import CartTable from "../../components/pos/CartTable";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../hooks/useCart";
import {
  findClientByDocument,
  getClients,
} from "../../services/clients.service";
import { getProducts } from "../../services/products.service";
import { createSale } from "../../services/sales.service";
import { services } from "../../types/payment.types";
import type { CatalogItem } from "../../types/pos.types";
import { PRODUCT_CATEGORY_LABELS } from "../../types/product.types";
import type { PaymentMethod, SaleClientInfo } from "../../types/sales.types";
import "../../styles/pos.css";

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const matchesQuery = (value: string, query: string) => {
  const normalizedValue = normalizeText(value);
  const tokens = normalizeText(query).split(" ").filter(Boolean);
  if (!tokens.length) {
    return true;
  }
  return tokens.every((token) => normalizedValue.includes(token));
};

const parseDecimal = (raw: string) => {
  const normalized = raw.replace(",", ".").replace(/[^0-9.]/g, "");
  const [whole, decimal] = normalized.split(".");
  const value = Number(decimal !== undefined ? `${whole}.${decimal}` : whole);
  return Number.isFinite(value) ? value : 0;
};

const buildCatalog = (
  products: ReturnType<typeof getProducts>,
): CatalogItem[] => {
  const productItems: CatalogItem[] = products
    .filter((product) => product.category !== "SERVICIOS_GYM")
    .map((product) => ({
      key: `product-${product.id}`,
      id: product.id,
      name: product.name,
      description: product.description,
      category: PRODUCT_CATEGORY_LABELS[product.category],
      unitPrice: product.unitPrice,
      stock: product.quantity,
      source: "PRODUCT",
    }));

  const membershipItems: CatalogItem[] = services.map((service) => ({
    key: `membership-${service.id}`,
    id: service.id,
    name: service.name,
    description: "Servicio del gimnasio",
    category: PRODUCT_CATEGORY_LABELS.SERVICIOS_GYM,
    unitPrice: service.price,
    stock: null,
    source: "MEMBERSHIP",
  }));

  return [...productItems, ...membershipItems];
};

const clampPercent = (value: number) => {
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    return 0;
  }
  return Math.min(Math.max(value, 0), 100);
};

const round2 = (value: number) => Math.round(value * 100) / 100;

const defaultClientLabel = "Consumidor final";
const defaultClientDocument = "9999999999999";

const Card = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [search, setSearch] = useState("");
  const [clientInput, setClientInput] = useState(defaultClientDocument);
  const [invoiceRequired, setInvoiceRequired] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [cashAmount, setCashAmount] = useState(0);
  const [transferAmount, setTransferAmount] = useState(0);

  useEffect(() => {
    getClients();
  }, []);

  const catalog = useMemo(() => buildCatalog(getProducts()), []);

  const {
    items,
    addItem,
    updateQuantity,
    updateItemDiscount,
    removeItem,
    clearCart,
    discountRate,
    setDiscountRate,
    taxRate,
    setTaxRate,
    totals,
  } = useCart();

  const filteredCatalog = useMemo(() => {
    if (!search.trim()) {
      return [];
    }
    return catalog.filter((item) =>
      matchesQuery(`${item.name} ${item.description} ${item.category}`, search),
    );
  }, [catalog, search]);

  const matchedClient = useMemo(() => {
    const normalizedInput = normalizeText(clientInput);
    if (
      !normalizedInput ||
      clientInput.trim() === defaultClientDocument ||
      normalizedInput === normalizeText(defaultClientLabel)
    ) {
      return null;
    }
    return findClientByDocument(clientInput.trim());
  }, [clientInput]);

  const saleClient: SaleClientInfo = useMemo(() => {
    if (matchedClient) {
      return {
        documentNumber: matchedClient.documentNumber,
        documentType: matchedClient.documentType,
        firstName: matchedClient.firstName,
        lastName: matchedClient.lastName,
        email: matchedClient.email,
        phone: matchedClient.phone,
        address: matchedClient.address,
      };
    }
    return {
      documentNumber: clientInput.trim() || defaultClientDocument,
      firstName: defaultClientLabel,
    };
  }, [clientInput, matchedClient]);

  useEffect(() => {
    const total = totals.total;
    if (paymentMethod === "CASH") {
      setCashAmount(total);
      setTransferAmount(0);
      return;
    }
    if (paymentMethod === "TRANSFER") {
      setCashAmount(0);
      setTransferAmount(total);
      return;
    }
    setCashAmount(total);
    setTransferAmount(0);
  }, [paymentMethod, totals.total]);

  const handleQtyChange = (key: string, quantity: number) => {
    if (Number.isNaN(quantity) || !Number.isFinite(quantity)) {
      updateQuantity(key, 1);
      return;
    }
    updateQuantity(key, quantity);
  };

  const handleDiscountChange = (value: number) => {
    const percent = clampPercent(value);
    setDiscountRate(percent / 100);
  };

  const handleTaxChange = (value: number) => {
    const percent = clampPercent(value);
    setTaxRate(percent / 100);
  };

  const handleClear = () => {
    if (!items.length) {
      return;
    }
    if (confirm("Deseas limpiar el carrito?")) {
      clearCart();
    }
  };

  const handleCheckout = () => {
    if (!items.length) {
      alert("Agrega productos o membresias al carrito.");
      return;
    }

    if (invoiceRequired && !matchedClient) {
      alert("Ingresa una cedula valida para la factura.");
      return;
    }

    if (paymentMethod === "MIXED") {
      const sum = round2(cashAmount + transferAmount);
      if (Math.abs(sum - totals.total) > 0.01) {
        alert("El total de efectivo y transferencia debe igualar el total.");
        return;
      }
    }

    if (confirm("Deseas registrar esta venta?")) {
      createSale({
        items,
        totals,
        client: saleClient,
        payment: {
          method: paymentMethod,
          cashAmount,
          transferAmount,
        },
        createdBy: user?.username,
      });
      clearCart();
    }
  };

  const handleClientBlur = () => {
    if (!clientInput.trim()) {
      setClientInput(defaultClientDocument);
    }
  };

  const handleClientFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === defaultClientDocument) {
      e.target.select();
    }
  };

  const handleCashChange = (value: number) => {
    const total = totals.total;
    const normalized = Math.max(0, Math.min(value, total));
    setCashAmount(round2(normalized));
    setTransferAmount(round2(Math.max(total - normalized, 0)));
  };

  const handleTransferChange = (value: number) => {
    const total = totals.total;
    const normalized = Math.max(0, Math.min(value, total));
    setTransferAmount(round2(normalized));
    setCashAmount(round2(Math.max(total - normalized, 0)));
  };

  const handleAddFromSearch = (item: CatalogItem) => {
    addItem(item);
    setSearch("");
  };

  const discountPercent = Number((discountRate * 100).toFixed(2));
  const taxPercent = Number((taxRate * 100).toFixed(2));

  return (
    <main className="pos-container">
      <section className="pos-header">
        <div>
          <h2>Punto de venta</h2>
          <p>Agrega productos y membresias al carrito.</p>
        </div>
      </section>

      <section className="pos-content">
        <div className="pos-panel pos-cart-panel">
          <div className="pos-section">
            <div className="pos-section-title">
              <UserRound size={18} />
              <h4>Cliente y factura</h4>
            </div>
            <div className="pos-field">
              <label>Cedula</label>
              <input
                value={clientInput}
                onChange={(e) => setClientInput(e.target.value)}
                onBlur={handleClientBlur}
                onFocus={handleClientFocus}
                placeholder={defaultClientLabel}
              />
            </div>
            <label className="pos-checkbox">
              <input
                type="checkbox"
                checked={invoiceRequired}
                onChange={(e) => setInvoiceRequired(e.target.checked)}
              />
              Requiere factura
            </label>
            <div className="pos-client-card">
              {matchedClient ? (
                <>
                  <div className="pos-client-row">
                    <span>Cliente</span>
                    <strong>
                      {matchedClient.firstName} {matchedClient.lastName}
                    </strong>
                  </div>
                  <div className="pos-client-row">
                    <span>Cedula</span>
                    <strong>{matchedClient.documentNumber}</strong>
                  </div>
                  {matchedClient.email && (
                    <div className="pos-client-row">
                      <span>Email</span>
                      <strong>{matchedClient.email}</strong>
                    </div>
                  )}
                  {matchedClient.phone && (
                    <div className="pos-client-row">
                      <span>Telefono</span>
                      <strong>{matchedClient.phone}</strong>
                    </div>
                  )}
                  {matchedClient.address && (
                    <div className="pos-client-row">
                      <span>Direccion</span>
                      <strong>{matchedClient.address}</strong>
                    </div>
                  )}
                </>
              ) : (
                <div className="pos-client-row">
                  <span>Cliente</span>
                  <strong>{defaultClientLabel}</strong>
                </div>
              )}
            </div>
            {invoiceRequired && !matchedClient && (
              <p className="pos-helper">
                No se encontro cliente con esa cedula.
              </p>
            )}
          </div>

          <div className="pos-section pos-cart-section">
            <div className="pos-cart-header">
              <div className="pos-cart-title">
                <ShoppingCart size={20} />
                <h3>Carrito</h3>
              </div>
              <button
                type="button"
                className="pos-clear-btn"
                onClick={handleClear}
              >
                <Trash2 size={16} />
                Limpiar
              </button>
            </div>

            <div className="pos-search-wrapper">
              <div className="pos-search">
                <Search size={16} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar productos o servicios"
                />
              </div>
              {search.trim().length > 0 && (
                <ul className="pos-search-dropdown">
                  {filteredCatalog.length > 0 ? (
                    filteredCatalog.map((item) => (
                      <li key={item.key}>
                        <button
                          type="button"
                          onClick={() => handleAddFromSearch(item)}
                        >
                          <span className="pos-suggestion-title">
                            {item.name}
                          </span>
                          <span className="pos-suggestion-meta">
                            {item.category} � ${item.unitPrice.toFixed(2)}
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

            {items.length === 0 ? (
              <div className="pos-empty">No hay items en el carrito.</div>
            ) : (
              <div className="pos-cart-table-wrapper">
                <CartTable
                  items={items}
                  onQtyChange={handleQtyChange}
                  onDiscountChange={updateItemDiscount}
                  onRemove={removeItem}
                />
              </div>
            )}

            <div className="pos-summary">
              <div className="pos-summary-row">
                <span>Subtotal</span>
                <strong>${totals.subtotal.toFixed(2)}</strong>
              </div>
              <div className="pos-summary-row">
                <span>Descuento</span>
                {isAdmin ? (
                  <div className="pos-rate-input">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={discountPercent}
                      onChange={(e) =>
                        handleDiscountChange(parseDecimal(e.target.value))
                      }
                    />
                    <span>%</span>
                  </div>
                ) : (
                  <span>{discountPercent}%</span>
                )}
              </div>
              <div className="pos-summary-row">
                <span>Descuento aplicado</span>
                <strong>-${totals.discountAmount.toFixed(2)}</strong>
              </div>
              <div className="pos-summary-row">
                <span>IVA</span>
                {isAdmin ? (
                  <div className="pos-rate-input">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={taxPercent}
                      onChange={(e) =>
                        handleTaxChange(parseDecimal(e.target.value))
                      }
                    />
                    <span>%</span>
                  </div>
                ) : (
                  <span>{taxPercent}%</span>
                )}
              </div>
              <div className="pos-summary-row">
                <span>IVA aplicado</span>
                <strong>${totals.taxAmount.toFixed(2)}</strong>
              </div>
              <div className="pos-summary-total">
                <span>Total final</span>
                <strong>${totals.total.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          <div className="pos-section">
            <div className="pos-section-title">
              <h4>Pago</h4>
            </div>
            <div className="pos-field">
              <label>Metodo de pago</label>
              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as PaymentMethod)
                }
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
                    onChange={(e) =>
                      handleCashChange(parseDecimal(e.target.value))
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
                      handleTransferChange(parseDecimal(e.target.value))
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="pos-field">
                <label>Monto</label>
                <input type="text" value={totals.total} readOnly />
              </div>
            )}
          </div>

          <button
            type="button"
            className="pos-checkout-btn"
            onClick={handleCheckout}
          >
            Registrar venta
          </button>
        </div>
      </section>
    </main>
  );
};

export default Card;
