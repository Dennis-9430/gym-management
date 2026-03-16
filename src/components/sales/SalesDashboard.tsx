import { useNavigate } from "react-router-dom";
import {
  BadgeDollarSign,
  ClipboardList,
  ShoppingCart,
} from "lucide-react";

interface SalesDashboardProps {
  onOpenSubscriptionModal: () => void;
  onOpenSaleModal: () => void;
}

const SalesDashboard = ({
  onOpenSubscriptionModal,
  onOpenSaleModal,
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
      </div>
    </section>
  );
};

export default SalesDashboard;
