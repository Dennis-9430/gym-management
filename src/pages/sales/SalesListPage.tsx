/* Página de Historial de Ventas */
import { useState, useEffect } from "react";
import { useAuth } from "../../context";
import { useNavigate } from "react-router";
import { getSales, verifyPaymentAPI } from "../../services/sales.service";
import type { SaleRecord, PaymentStatus } from "../../types/sales.types";
import { Search, Filter, CheckCircle, Clock, Eye, Edit, Loader2, ArrowLeft } from "lucide-react";
import EditVoucherModal from "../../components/sales/EditVoucherModal";
import "../../styles/pos.css";

const SalesListPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "ADMIN";
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [saleToEdit, setSaleToEdit] = useState<SaleRecord | null>(null);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    setLoading(true);
    try {
      const data = await getSales();
      setSales(data);
    } catch (error) {
      console.error("Error cargando ventas:", error);
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleVerifyPayment = async (saleId: string) => {
    if (!isAdmin) return;
    setUpdating(saleId);
    try {
      await verifyPaymentAPI(saleId);
      await loadSales();
    } catch (error) {
      console.error("Error verificando pago:", error);
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
                        {sale.client.firstName} {sale.client.lastName}
                      </strong>
                      <span>{sale.client.documentNumber}</span>
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
                      {isAdmin && sale.paymentStatus === "pending" && (
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
                      {isAdmin && (
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
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pos-list-summary">
        <span>
          {filteredSales.length} venta(s) de {sales.length}
        </span>
        <span>
          Total: ${filteredSales.reduce((sum, s) => sum + s.totals.total, 0).toFixed(2)}
        </span>
      </div>

      <EditVoucherModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        sale={saleToEdit}
        onSave={loadSales}
      />
    </div>
  );
};

export default SalesListPage;