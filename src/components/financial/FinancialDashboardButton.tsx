import { useNavigate } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import { usePlanAccess } from "../../hooks/usePlanAccess";

/* Boton para navegar al dashboard financiero */
const FinancialDashboardButton = () => {
  const navigate = useNavigate();
  const { isPremium } = usePlanAccess();

  const handleClick = () => {
    navigate("/financial/dashboard");
  };

  if (!isPremium()) {
    return (
      <div className="financial-dashboard-locked">
        <button className="financial-dashboard-btn financial-dashboard-btn--locked" onClick={() => {}}>
          <BarChart3 size={18} />
          Ver Estadísticas
        </button>
        <span className="pro-badge">PRO</span>
      </div>
    );
  }

  return (
    <button className="financial-dashboard-btn" onClick={handleClick}>
      <BarChart3 size={18} />
      Ver Estadísticas
    </button>
  );
};

export default FinancialDashboardButton;