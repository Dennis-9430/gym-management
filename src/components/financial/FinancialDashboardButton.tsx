import { useNavigate } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import { Button } from "../common";

const FinancialDashboardButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/financial/dashboard");
  };

  return (
    <Button onClick={handleClick} className="financial-dashboard-btn">
      <BarChart3 size={18} />
      Ver Estadísticas
    </Button>
  );
};

export default FinancialDashboardButton;
