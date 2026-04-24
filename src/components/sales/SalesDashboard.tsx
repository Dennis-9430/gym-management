import { useNavigate } from "react-router-dom";
import {
  BadgeDollarSign,
  ClipboardList,
  ShoppingCart,
  CreditCard,
} from "lucide-react";

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

  const goToPendingList = () => {
    navigate("/sales/pending");
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
        <div className="pos-dashboard-card">
          <div className="pos-card-icon">
            <BadgeDollarSign size={22} />
          </div>
          <h3>Suscripciones pendientes</h3>
          <p>Visualiza cobros pendientes y renovaciones.</p>
          <button
            type="button"
            className="pos-card-btn primary"
            onClick={goToPendingList}
          >
            Ver lista
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
