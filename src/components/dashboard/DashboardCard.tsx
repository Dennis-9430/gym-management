import type { ReactNode } from "react";
import { ArrowRight, Lock } from "lucide-react";
import { usePlanAccess } from "../../hooks/usePlanAccess";
import "../../styles/dashboardCard.css";

/* Tarjeta de acceso rapido del dashboard */
interface DashboardCardProps {
  title: string;
  icon: ReactNode;
  description?: string;
  buttonLabel: string;
  plan?: "BASIC" | "PREMIUM";
  onClick: () => void;
}

const DashboardCard = ({ title, icon, description, buttonLabel, plan, onClick }: DashboardCardProps) => {
  const { isPremium } = usePlanAccess();
  const isLocked = plan === "PREMIUM" && !isPremium();

  const handleClick = () => {
    onClick();
  };

  if (isLocked) {
    return (
      <div className="dashboard-card dashboard-card--locked">
        <div className="dashboard-card__icon dashboard-card__icon--locked">
          {icon}
        </div>
        <h3 className="dashboard-card__title">{title}</h3>
        {description && (
          <p className="dashboard-card__description">{description}</p>
        )}
        <button 
          className="dashboard-card__button dashboard-card__button--locked" 
          onClick={handleClick}
          type="button"
        >
          <Lock size={14} />
          {buttonLabel}
        </button>
        <span className="pro-badge">PRO</span>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div className="dashboard-card__icon">
        {icon}
      </div>
      <h3 className="dashboard-card__title">{title}</h3>
      {description && (
        <p className="dashboard-card__description">{description}</p>
      )}
      <button 
        className="dashboard-card__button" 
        onClick={onClick}
        type="button"
      >
        {buttonLabel}
        <ArrowRight size={16} />
      </button>
    </div>
  );
};

export default DashboardCard;
