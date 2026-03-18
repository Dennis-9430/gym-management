import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import "../../styles/dashboardCard.css";

interface DashboardCardProps {
  title: string;
  icon: ReactNode;
  description?: string;
  buttonLabel: string;
  onClick: () => void;
}

const DashboardCard = ({ title, icon, description, buttonLabel, onClick }: DashboardCardProps) => {
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
