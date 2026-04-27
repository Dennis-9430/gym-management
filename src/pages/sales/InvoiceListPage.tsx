/* Página de lista de facturas */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Search, ArrowLeft, Send, Download, Eye } from "lucide-react";
import { useAuth } from "../../context/index.ts";
import invoiceService from "../../services/invoice.service";
import type { Invoice } from "../../types/invoice.types";
import "../../styles/invoiceList.css";

const InvoiceListPage = () => {
  const navigate = useNavigate();
  const { tenant } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    loadInvoices();
  }, [tenant?.tenantId]);

  const loadInvoices = async () => {
    if (!tenant?.tenantId) return;
    
    try {
      setLoading(true);
      const response = await invoiceService.getInvoices(tenant.tenantId);
      setInvoices(response.invoices);
    } catch (error) {
      console.error("Error loading invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const searchLower = search.toLowerCase();
    return (
      inv.invoiceNumber.toLowerCase().includes(searchLower) ||
      inv.client.firstName.toLowerCase().includes(searchLower) ||
      inv.client.lastName.toLowerCase().includes(searchLower) ||
      inv.client.documentNumber.includes(search)
    );
  });

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
            <ArrowLeft size={20} />
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
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
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
              {filteredInvoices.map((invoice) => (
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