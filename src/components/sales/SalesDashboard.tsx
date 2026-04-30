import { useNavigate } from "react-router-dom";
import {
  BadgeDollarSign,
  ClipboardList,
  ShoppingCart,
  CreditCard,
  FileText,
  Receipt,
} from "lucide-react";
import { usePlanAccess } from "../../hooks/usePlanAccess";

/* Dashboard de ventas con opciones principales */
interface SalesDashboardProps {
  onOpenSubscriptionModal: () => void;
  onOpenSaleModal: () => void;
  onOpenMembershipModal?: () => void;
}

const SalesDashboard = ({
  onOpenSubscriptionModal,
  onOpenSaleModal,
  onOpenMembershipModal,
}: SalesDashboardProps) => {
  const navigate = useNavigate();
  const { isPremium } = usePlanAccess();

  const goToPendingList = () => {
    if (!isPremium()) {
      alert("Las suscripciones pendientes están disponibles en el plan PREMIUM.");
      return;
    }
    navigate("/sales/pending");
  };

  const goToInvoices = () => {
    if (!isPremium()) {
      alert("Las facturas están disponibles en el plan PREMIUM.");
      return;
    }
    navigate("/sales/invoices");
  };

  const goToSalesList = () => {
    navigate("/sales/list");
  };

  return (
    <section className="pos-dashboard">
      <div className="pos-dashboard-header">
        <div>
          <h2>Ventas</h2>
          <p>Panel rapido para operaciones del gimnasio.</p>
        </div>
      </div>
      <div className="pos-dashboard-grid">
        <div className="pos-dashboard-card">
          <div className="pos-card-icon">
            <ClipboardList size={22} />
          </div>
          <h3>Agregar una suscripcion</h3>
          <p>Registra nuevas membresias para tus clientes.</p>
          <button
            type="button"
            className="pos-card-btn primary"
            onClick={onOpenSubscriptionModal}
          >
            Registrar suscripcion
          </button>
        </div>
        <div className={`pos-dashboard-card ${!isPremium() ? "pos-pending-locked" : ""}`}>
          <div className="pos-card-icon">
            <BadgeDollarSign size={22} />
          </div>
          <h3>Suscripciones pendientes</h3>
          <p>Visualiza cobros pendientes y renovaciones.</p>
          <button
            type="button"
            className={`pos-card-btn ${isPremium() ? "primary" : "locked"}`}
            onClick={goToPendingList}
          >
            {isPremium() ? "Ver lista" : "🔒 PREMIUM"}
          </button>
        </div>
        <div className="pos-dashboard-card">
          <div className="pos-card-icon">
            <ShoppingCart size={22} />
          </div>
          <h3>Ventas de productos</h3>
          <p>Registra productos y servicios desde el POS.</p>
          <button
            type="button"
            className="pos-card-btn primary"
            onClick={onOpenSaleModal}
          >
            Agregar venta
          </button>
        </div>
        <div className="pos-dashboard-card">
          <div className="pos-card-icon">
            <Receipt size={22} />
          </div>
          <h3>Historial de Ventas</h3>
          <p>Ver todas las ventas con estado de pago.</p>
          <button
            type="button"
            className="pos-card-btn primary"
            onClick={goToSalesList}
          >
            Ver ventas
          </button>
        </div>
        <div className={`pos-dashboard-card ${!isPremium() ? "pos-pending-locked" : ""}`}>
          <div className="pos-card-icon">
            <FileText size={22} />
          </div>
          <h3>Facturas</h3>
          <p>Historial y generación de facturas.</p>
          <button
            type="button"
            className={`pos-card-btn ${isPremium() ? "primary" : "locked"}`}
            onClick={goToInvoices}
          >
            {isPremium() ? "Ver facturas" : "🔒 PREMIUM"}
          </button>
        </div>
        {onOpenMembershipModal && (
          <div className="pos-dashboard-card">
            <div className="pos-card-icon">
              <CreditCard size={22} />
            </div>
            <h3>Membresías</h3>
            <p>Configura los planes disponibles.</p>
            <button
              type="button"
              className="pos-card-btn primary"
              onClick={onOpenMembershipModal}
            >
              Gestionar
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default SalesDashboard;
