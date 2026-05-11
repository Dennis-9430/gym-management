/* Página de Historial de Ventas */
import { useState, useEffect } from "react";
import { useAuth } from "../../context";
import { useNavigate } from "react-router";
import { getSales, verifyPaymentAPI, deleteSaleAPI } from "../../services/sales.service";
import type { SaleRecord, PaymentStatus } from "../../types/sales.types";
import { Search, Filter, CheckCircle, Clock, Eye, Edit, Loader2, ArrowLeft, Trash2, PackageOpen, ShoppingBag, CreditCard, Hash, User, DollarSign } from "lucide-react";
import EditVoucherModal from "../../components/sales/EditVoucherModal";
import Modal from "../../components/common/Modal";
import "../../styles/pos.css";

const SalesListPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "ADMIN";
  const isGerente = user?.role === "GERENTE";
  const canManageSales = isAdmin || isGerente;
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [saleToEdit, setSaleToEdit] = useState<SaleRecord | null>(null);
  const [detailSale, setDetailSale] = useState<SaleRecord | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    setLoading(true);
    try {
      const data = await getSales();
      setSales(data);
    } catch (error) {
      console.warn("Error al cargar ventas:", error);
      // No mostramos alerta porque getSales ya maneja errores via api.ts
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales.filter((sale) => {
    if (filter === "pending" && sale.paymentStatus !== "pending") return false;
    if (filter === "verified" && sale.paymentStatus !== "verified") return false;
    
    if (search) {
      const searchLower = search.toLowerCase();
      const clientName = `${sale.client.firstName || ""} ${sale.client.lastName || ""}`.toLowerCase();
      const documentNumber = sale.client.documentNumber?.toLowerCase() || "";
      if (!clientName.includes(searchLower) && !documentNumber.includes(searchLower)) {
        return false;
      }
    }

    if (dateFrom || dateTo) {
      const saleDate = new Date(sale.createdAt);
      if (dateFrom && saleDate < new Date(dateFrom)) return false;
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59);
        if (saleDate > toDate) return false;
      }
    }
    return true;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleVerifyPayment = async (saleId: string) => {
    if (!canManageSales) return;
    setUpdating(saleId);
    try {
      await verifyPaymentAPI(saleId);
      await loadSales();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al verificar pago. Intenta de nuevo.");
    } finally {
      setUpdating(null);
    }
  };

  const handleEditVoucher = (sale: SaleRecord) => {
    setSaleToEdit(sale);
    setEditModalOpen(true);
  };

  const handleViewImage = (sale: SaleRecord) => {
    if (sale.voucherImage) {
      window.open(sale.voucherImage, "_blank");
    }
  };

  const handleViewDetail = (sale: SaleRecord) => {
    setDetailSale(sale);
    setDetailModalOpen(true);
  };

  const handleDeleteSale = async (sale: SaleRecord) => {
    if (!confirm(`¿Estás seguro de eliminar la venta #${sale.id}?`)) return;
    const success = await deleteSaleAPI(sale.id.toString());
    if (success) {
      await loadSales();
    } else {
      alert("Error al eliminar la venta");
    }
  };

  const getStatusBadge = (status: PaymentStatus | undefined) => {
    if (status === "verified") {
      return (
        <span className="sale-status-badge verified">
          <CheckCircle size={14} />
          Verificado
        </span>
      );
    }
    return (
      <span className="sale-status-badge pending">
        <Clock size={14} />
        Pendiente
      </span>
    );
  };

  const getPaymentMethod = (method: string) => {
    const methods: Record<string, string> = {
      CASH: "Efectivo",
      TRANSFER: "Transferencia",
      DEPOSIT: "Depósito/Tarjeta",
    };
    return methods[method] || method;
  };

  if (loading) {
    return (
      <div className="pos-container">
        <div className="pos-loading">
          <Loader2 size={24} className="spin" />
          Cargando ventas...
        </div>
      </div>
    );
  }

  return (
    <div className="pos-container">
      <div className="pos-list-header">
        <div className="pos-list-header-row">
          <button 
            type="button" 
            className="pos-btn-back" 
            onClick={() => navigate("/sales")}
          >
            <ArrowLeft size={18} />
            Volver
          </button>
          <div>
            <h2>Historial de Ventas</h2>
            <p>Todas las ventas del gimnasio</p>
          </div>
        </div>
      </div>

      <div className="pos-list-filters">
        <div className="pos-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por cliente o cedula..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="pos-filter-box date-filter">
          <span className="date-label">Desde:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <span>-</span>
          <span className="date-label">Hasta:</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        
        <div className="pos-filter-box">
          <Filter size={18} />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="verified">Verificados</option>
          </select>
        </div>
      </div>

      <div className="pos-table-scroll">
        <table className="pos-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Método</th>
              <th>Total</th>
              <th>Voucher</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan={7} className="pos-empty">
                  No hay ventas para mostrar
                </td>
              </tr>
            ) : (
              filteredSales.map((sale) => (
                <tr key={sale.id}>
                  <td>{formatDate(sale.createdAt)}</td>
                  <td>
                    <div className="sale-client">
                      <strong>
                        {sale.client.firstName || sale.client.lastName
                          ? `${sale.client.firstName || ""} ${sale.client.lastName || ""}`.trim()
                          : "Consumidor Final"}
                      </strong>
                      {sale.client.documentNumber && (
                        <span>{sale.client.documentNumber}</span>
                      )}
                    </div>
                  </td>
                  <td>{getPaymentMethod(sale.payment.method)}</td>
                  <td className="sale-total">
                    ${sale.totals.total.toFixed(2)}
                  </td>
                  <td>{sale.voucherCode || "-"}</td>
                  <td>{getStatusBadge(sale.paymentStatus)}</td>
                  <td>
                    <div className="sale-actions">
                      <button
                        className="pos-btn-icon"
                        title="Ver detalle de venta"
                        onClick={() => handleViewDetail(sale)}
                      >
                        <PackageOpen size={16} />
                      </button>
                      {canManageSales && sale.paymentStatus === "pending" && (
                        <button
                          className="pos-btn-icon"
                          title="Verificar pago"
                          onClick={() => handleVerifyPayment(sale.id.toString())}
                          disabled={updating === sale.id.toString()}
                        >
                          {updating === sale.id.toString() ? (
                            <Loader2 size={16} className="spin" />
                          ) : (
                            <CheckCircle size={16} />
                          )}
                        </button>
                      )}
                      {canManageSales && (
                        <button
                          className="pos-btn-icon"
                          title="Editar voucher / Subir comprobante"
                          onClick={() => handleEditVoucher(sale)}
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {sale.voucherImage && (
                        <button
                          className="pos-btn-icon"
                          title="Ver comprobante"
                          onClick={() => handleViewImage(sale)}
                        >
                          <Eye size={16} />
                        </button>
                      )}
                      {isGerente && (
                        <button
                          className="pos-btn-icon pos-btn-icon--danger"
                          title="Eliminar venta"
                          onClick={() => handleDeleteSale(sale)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <EditVoucherModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        sale={saleToEdit}
        onSave={loadSales}
      />

      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Detalle de Venta"
        size="md"
        centered
      >
        {detailSale && (
          <div className="sale-detail">
            <div className="sale-detail__header">
              <div className="sale-detail__field">
                <Hash size={14} />
                <span>Venta #{String(detailSale.id).slice(0, 8)}</span>
              </div>
              <div className="sale-detail__field">
                <User size={14} />
                <span>
                  {detailSale.client.firstName || detailSale.client.lastName
                    ? `${detailSale.client.firstName || ""} ${detailSale.client.lastName || ""}`.trim()
                    : "Consumidor Final"}
                </span>
              </div>
              <div className="sale-detail__field">
                <DollarSign size={14} />
                <span>Total: ${detailSale.totals.total.toFixed(2)}</span>
              </div>
              <div className="sale-detail__field">
                <CreditCard size={14} />
                <span>{getPaymentMethod(detailSale.payment.method)}</span>
              </div>
            </div>

            <h4 className="sale-detail__items-title">Productos / Servicios</h4>
            <table className="pos-table sale-detail__table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cant.</th>
                  <th>P.Unit</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {detailSale.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="sale-detail__item-name">
                        {item.source === "MEMBERSHIP" || item.source === "DAILY" ? (
                          <ShoppingBag size={14} className="item-icon-membership" />
                        ) : (
                          <PackageOpen size={14} className="item-icon-product" />
                        )}
                        {item.name}
                      </div>
                    </td>
                    <td>{item.quantity}</td>
                    <td>${item.unitPrice.toFixed(2)}</td>
                    <td className="sale-total">${item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="sale-detail__total-label">Total</td>
                  <td className="sale-total">${detailSale.totals.total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            {detailSale.createdBy && (
              <div className="sale-detail__footer">
                <small>Registrado por: {detailSale.createdBy}</small>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SalesListPage;