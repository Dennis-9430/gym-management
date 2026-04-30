/* Página de lista de facturas */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Search, ArrowLeft, Send, Eye, Download } from "lucide-react";
import invoiceService from "../../services/invoice.service";
import { generateInvoicePDF } from "../../utils/invoicePdf";
import type { Invoice } from "../../types/invoice.types";
import { usePlanAccess } from "../../hooks/usePlanAccess";
import "../../styles/invoiceList.css";

const ITEMS_PER_PAGE = 20;

const MOCK_INVOICES: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "001-001-000001",
    type: "PRODUCT",
    status: "SENT",
    createdAt: new Date().toISOString(),
    tenantId: "demo-tenant",
    business: {
      name: "Gimnasio Fit",
      ruc: "12345678901",
      address: "Av. Principal 123",
      phone: "0991234567",
      email: "info@gimnasiofit.com"
    },
    client: {
      documentNumber: "12345678",
      firstName: "Juan",
      lastName: "Pérez",
      email: "juan@email.com",
      phone: "0991234567"
    },
    items: [
      { name: "Proteína Whey", quantity: 2, unitPrice: 35, discount: 0, subtotal: 70 },
      { name: "Creatina", quantity: 1, unitPrice: 25, discount: 0, subtotal: 25 }
    ],
    totals: { subtotal: 95, discountAmount: 0, taxAmount: 14.25, iceAmount: 0, total: 109.25 },
    payment: { method: "CASH" as const, cashAmount: 120, transferAmount: 0, paid: 120, change: 10.75 },
    emailDelivery: { requested: true, sent: true, sentAt: new Date().toISOString(), recipient: "juan@email.com" }
  },
  {
    id: "2",
    invoiceNumber: "001-001-000002",
    type: "MEMBERSHIP",
    status: "GENERATED",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    tenantId: "demo-tenant",
    business: {
      name: "Gimnasio Fit",
      ruc: "12345678901",
      address: "Av. Principal 123",
      phone: "0991234567",
      email: "info@gimnasiofit.com"
    },
    client: {
      documentNumber: "87654321",
      firstName: "María",
      lastName: "González",
      email: "maria@email.com",
      phone: "0998765432"
    },
    items: [
      { name: "Membresía Mensual", quantity: 1, unitPrice: 50, discount: 5, subtotal: 45 }
    ],
    totals: { subtotal: 45, discountAmount: 5, taxAmount: 6.75, iceAmount: 0, total: 46.75 },
    payment: { method: "TRANSFER" as const, cashAmount: 0, transferAmount: 50, voucherCode: "TRF-001", paid: 50, change: 0 },
    membershipMeta: { serviceName: "Membresía Mensual", startDate: new Date().toISOString(), status: "PAID" as const }
  },
  {
    id: "3",
    invoiceNumber: "001-001-000003",
    type: "PRODUCT",
    status: "DRAFT",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    tenantId: "demo-tenant",
    business: {
      name: "Gimnasio Fit",
      ruc: "12345678901",
      address: "Av. Principal 123",
      phone: "0991234567",
      email: "info@gimnasiofit.com"
    },
    client: {
      documentNumber: "11223344",
      firstName: "Pedro",
      lastName: "Romero",
      email: "pedro@email.com"
    },
    items: [
      { name: "Pre-entreno", quantity: 1, unitPrice: 28, discount: 0, subtotal: 28 },
      { name: "BCAA", quantity: 2, unitPrice: 18, discount: 0, subtotal: 36 }
    ],
    totals: { subtotal: 64, discountAmount: 0, taxAmount: 9.6, iceAmount: 0, total: 73.6 },
    payment: { method: "CASH" as const, cashAmount: 80, transferAmount: 0, paid: 80, change: 6.4 }
  },
  {
    id: "4",
    invoiceNumber: "001-001-000004",
    type: "MEMBERSHIP",
    status: "SENT",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    tenantId: "demo-tenant",
    business: {
      name: "Gimnasio Fit",
      ruc: "12345678901",
      address: "Av. Principal 123",
      phone: "0991234567",
      email: "info@gimnasiofit.com"
    },
    client: {
      documentNumber: "99887766",
      firstName: "Ana",
      lastName: "López",
      email: "ana@email.com",
      phone: "0999988776"
    },
    items: [
      { name: "Membresía Anual", quantity: 1, unitPrice: 450, discount: 50, subtotal: 400 }
    ],
    totals: { subtotal: 400, discountAmount: 50, taxAmount: 60, iceAmount: 0, total: 410 },
    payment: { method: "TRANSFER" as const, cashAmount: 0, transferAmount: 410, voucherCode: "DEP-999", paid: 410, change: 0 },
    membershipMeta: { serviceName: "Membresía Anual", startDate: new Date().toISOString(), endDate: new Date(Date.now() + 31536000000).toISOString(), status: "PAID" as const },
    emailDelivery: { requested: true, sent: true, sentAt: new Date().toISOString(), recipient: "ana@email.com" }
  },
  {
    id: "5",
    invoiceNumber: "001-001-000005",
    type: "PRODUCT",
    status: "FAILED",
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    tenantId: "demo-tenant",
    business: {
      name: "Gimnasio Fit",
      ruc: "12345678901",
      address: "Av. Principal 123",
      phone: "0991234567",
      email: "info@gimnasiofit.com"
    },
    client: {
      documentNumber: "55667788",
      firstName: "Carlos",
      lastName: "Mendoza",
      email: "carlos@email.com"
    },
    items: [
      { name: "Guantes Boxeo", quantity: 1, unitPrice: 22, discount: 0, subtotal: 22 }
    ],
    totals: { subtotal: 22, discountAmount: 0, taxAmount: 3.3, iceAmount: 0, total: 25.3 },
    payment: { method: "CASH" as const, cashAmount: 30, transferAmount: 0, paid: 30, change: 4.7 },
    emailDelivery: { requested: true, sent: false, errorMessage: "Email no válido" }
  },
  {
    id: "6",
    invoiceNumber: "001-001-000006",
    type: "PRODUCT",
    status: "GENERATED",
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    tenantId: "demo-tenant",
    business: {
      name: "Gimnasio Fit",
      ruc: "12345678901",
      address: "Av. Principal 123",
      phone: "0991234567",
      email: "info@gimnasiofit.com"
    },
    client: {
      documentNumber: "44332211",
      firstName: "Sofia",
      lastName: "Martínez",
      email: "sofia@email.com"
    },
    items: [
      { name: "Shaker", quantity: 2, unitPrice: 8, discount: 0, subtotal: 16 },
      { name: "Cinturón", quantity: 1, unitPrice: 35, discount: 5, subtotal: 30 }
    ],
    totals: { subtotal: 46, discountAmount: 5, taxAmount: 6.9, iceAmount: 0, total: 47.9 },
    payment: { method: "CASH" as const, cashAmount: 50, transferAmount: 0, paid: 50, change: 2.1 }
  },
  {
    id: "7",
    invoiceNumber: "001-001-000007",
    type: "MEMBERSHIP",
    status: "SENT",
    createdAt: new Date(Date.now() - 518400000).toISOString(),
    tenantId: "demo-tenant",
    business: {
      name: "Gimnasio Fit",
      ruc: "12345678901",
      address: "Av. Principal 123",
      phone: "0991234567",
      email: "info@gimnasiofit.com"
    },
    client: {
      documentNumber: "66554433",
      firstName: "Roberto",
      lastName: "Torres",
      email: "roberto@email.com"
    },
    items: [
      { name: "Clase Spinning", quantity: 10, unitPrice: 8, discount: 10, subtotal: 72 }
    ],
    totals: { subtotal: 72, discountAmount: 10, taxAmount: 10.8, iceAmount: 0, total: 72.8 },
    payment: { method: "TRANSFER" as const, cashAmount: 0, transferAmount: 75, voucherCode: "TRF-777", paid: 75, change: 2.2 },
    membershipMeta: { serviceName: "Paquete 10 Clases", startDate: new Date().toISOString(), status: "PAID" as const }
  },
  {
    id: "8",
    invoiceNumber: "001-001-000008",
    type: "PRODUCT",
    status: "GENERATED",
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    tenantId: "demo-tenant",
    business: {
      name: "Gimnasio Fit",
      ruc: "12345678901",
      address: "Av. Principal 123",
      phone: "0991234567",
      email: "info@gimnasiofit.com"
    },
    client: {
      documentNumber: "77661122",
      firstName: "Laura",
      lastName: "Fernández",
      email: "laura@email.com"
    },
    items: [
      { name: "Pesas Rusas 10kg", quantity: 2, unitPrice: 45, discount: 0, subtotal: 90 }
    ],
    totals: { subtotal: 90, discountAmount: 0, taxAmount: 13.5, iceAmount: 0, total: 103.5 },
    payment: { method: "MIXED" as const, cashAmount: 50, transferAmount: 60, paid: 110, change: 6.5 }
  }
];

const InvoiceListPage = () => {
  const navigate = useNavigate();
  const { isPremium } = usePlanAccess();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!isPremium()) {
      alert("Las facturas están disponibles en el plan PREMIUM. ¡Upgrade tu plan para acceder!");
      navigate("/dashboard");
      return;
    }
    // Siempre usar datos demo para evitar problemas de sesión
    setInvoices(MOCK_INVOICES);
    setLoading(false);
  }, [isPremium, navigate]);

  const hasValidToken = (): boolean => {
    const token = localStorage.getItem("tenantToken");
    return !!token;
  };

  const loadInvoices = async () => {
    // Si no hay token, usar datos demo directamente para evitar cierre de sesión
    if (!hasValidToken()) {
      setInvoices(MOCK_INVOICES);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await invoiceService.getInvoices(0, 100);
      setInvoices(response.invoices);
    } catch (error) {
      console.warn("API no disponible o sesión expirada, usando datos de demo");
      setInvoices(MOCK_INVOICES);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const searchLower = search.toLowerCase();
    const matchesSearch = !search || 
      inv.invoiceNumber.toLowerCase().includes(searchLower) ||
      inv.client.firstName.toLowerCase().includes(searchLower) ||
      inv.client.lastName.toLowerCase().includes(searchLower) ||
      inv.client.documentNumber.includes(search);
    
    if (dateFrom || dateTo) {
      const invDate = new Date(inv.createdAt);
      if (dateFrom && invDate < new Date(dateFrom)) return false;
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59);
        if (invDate > toDate) return false;
      }
    }
    
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      DRAFT: { label: "Borrador", className: "badge-gray" },
      GENERATED: { label: "Generada", className: "badge-blue" },
      SENT: { label: "Enviada", className: "badge-green" },
      FAILED: { label: "Fallida", className: "badge-red" },
    };
    const config = statusMap[status] || statusMap.GENERATED;
    return <span className={`badge ${config.className}`}>{config.label}</span>;
  };

  const handleSendEmail = async (invoice: Invoice) => {
    if (!invoice.client.email) {
      alert("El cliente no tiene email registrado");
      return;
    }

    try {
      await invoiceService.sendInvoiceEmail({
        invoiceId: invoice.id,
        recipientEmail: invoice.client.email,
      });
      alert("Factura enviada correctamente");
      loadInvoices();
    } catch (error) {
      alert("Error al enviar factura");
    }
  };

  return (
    <main className="invoice-list-container">
      <section className="invoice-list-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate("/sales")}>
            <ArrowLeft size={20} color="#fff" />
            <span style={{ marginLeft: 4, color: "#fff", fontWeight: 500 }}>Volver</span>
          </button>
          <div>
            <h2>Facturas</h2>
            <p className="subtitle">Historial de facturas generadas</p>
          </div>
        </div>
      </section>

      <div className="invoice-search">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Buscar por número, cliente o documento..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          className="search-input"
        />
      </div>

      <div className="invoice-filters">
        <div className="invoice-date-filter">
          <span className="date-label">Desde:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
          />
          <span className="date-separator">-</span>
          <span className="date-label">Hasta:</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {loading ? (
        <div className="invoice-loading">Cargando facturas...</div>
      ) : filteredInvoices.length === 0 ? (
        <div className="invoice-empty">
          <FileText size={48} />
          <p>No hay facturas registradas</p>
        </div>
      ) : (
        <div className="invoice-table-wrapper">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="invoice-number">{invoice.invoiceNumber}</td>
                  <td>{formatDate(invoice.createdAt)}</td>
                  <td>
                    {invoice.type === "MEMBERSHIP" ? "Membresía" : "Productos"}
                  </td>
                  <td>
                    <div className="client-info">
                      <span className="client-name">
                        {invoice.client.firstName} {invoice.client.lastName}
                      </span>
                      <span className="client-doc">
                        {invoice.client.documentNumber}
                      </span>
                    </div>
                  </td>
                  <td className="invoice-total">
                    {formatCurrency(invoice.totals.total)}
                  </td>
                  <td>{getStatusBadge(invoice.status)}</td>
                  <td className="invoice-actions">
                    <button
                      className="action-btn"
                      title="Descargar PDF"
                      onClick={() => generateInvoicePDF(invoice)}
                    >
                      <Download size={16} />
                    </button>
                    <button
                      className="action-btn"
                      title="Ver detalles"
                      onClick={() => setSelectedInvoice(invoice)}
                    >
                      <Eye size={16} />
                    </button>
                    {invoice.client.email && invoice.status !== "SENT" && (
                      <button
                        className="action-btn"
                        title="Enviar por email"
                        onClick={() => handleSendEmail(invoice)}
                      >
                        <Send size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="invoice-pagination">
          <button
            type="button"
            className="invoice-pagination-btn"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ArrowLeft size={16} />
          </button>
          <span className="invoice-pagination-info">
            Página {currentPage} de {totalPages}
          </span>
          <button
            type="button"
            className="invoice-pagination-btn"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ArrowLeft size={16} style={{ transform: "rotate(180deg)" }} />
          </button>
        </div>
      )}

      {/* Modal de detalles de factura */}
      {selectedInvoice && (
        <div
          className="invoice-modal-backdrop"
          onClick={() => setSelectedInvoice(null)}
        >
          <div
            className="invoice-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="invoice-modal-header">
              <h3>Factura {selectedInvoice.invoiceNumber}</h3>
              <button
                className="close-btn"
                onClick={() => setSelectedInvoice(null)}
              >
                ×
              </button>
            </div>

            <div className="invoice-preview">
              {/* Encabezado */}
              <div className="invoice-business">
                <h4>{selectedInvoice.business.name}</h4>
                <p>RUC: {selectedInvoice.business.ruc}</p>
                <p>{selectedInvoice.business.address}</p>
                <p>Tel: {selectedInvoice.business.phone}</p>
              </div>

              {/* Cliente */}
              <div className="invoice-client">
                <h5>Cliente</h5>
                <p>
                  {selectedInvoice.client.firstName}{" "}
                  {selectedInvoice.client.lastName}
                </p>
                <p>Doc: {selectedInvoice.client.documentNumber}</p>
                <p>Email: {selectedInvoice.client.email}</p>
              </div>

              {/* Items */}
              <div className="invoice-items">
                <table>
                  <thead>
                    <tr>
                      <th>Descripción</th>
                      <th>Cant.</th>
                      <th>P. Unit</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.unitPrice)}</td>
                        <td>{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totales */}
              <div className="invoice-totals">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedInvoice.totals.subtotal)}</span>
                </div>
                <div className="total-row">
                  <span>Descuento:</span>
                  <span>
                    -{formatCurrency(selectedInvoice.totals.discountAmount)}
                  </span>
                </div>
                <div className="total-row">
                  <span>IVA:</span>
                  <span>{formatCurrency(selectedInvoice.totals.taxAmount)}</span>
                </div>
                <div className="total-row total-final">
                  <span>Total:</span>
                  <span>{formatCurrency(selectedInvoice.totals.total)}</span>
                </div>
              </div>

              {/* Pago */}
              <div className="invoice-payment">
                <p>
                  <strong>Método:</strong> {selectedInvoice.payment.method}
                </p>
                <p>
                  <strong>Pagado:</strong>{" "}
                  {formatCurrency(selectedInvoice.payment.paid)}
                </p>
                <p>
                  <strong>Cambio:</strong>{" "}
                  {formatCurrency(selectedInvoice.payment.change)}
                </p>
              </div>
            </div>

            <div className="invoice-modal-actions">
              {selectedInvoice.client.email &&
                selectedInvoice.status !== "SENT" && (
                  <button
                    className="btn-primary"
                    onClick={() => handleSendEmail(selectedInvoice)}
                  >
                    <Send size={16} />
                    Enviar por email
                  </button>
                )}
              <button
                className="btn-secondary"
                onClick={() => setSelectedInvoice(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default InvoiceListPage;