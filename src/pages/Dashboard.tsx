import { useState } from "react";
import { useAuth } from "../context/index.ts";
import { useNavigate } from "react-router-dom";
import { sections, type DashboardSection } from "../types/dashboard.section";
import PaymentModal from "../pages/payments/PaymentModal";
import DashboardCard from "../components/dashboard/DashboardCard";
import "../styles/dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  if (!user) return null;

  const filteredSections = sections.filter((section) =>
    section.roles.includes(user.role),
  );

  const handleAction = (section: DashboardSection) => {
    if (section.action === "NAVIGATE" && section.path) {
      setTimeout(() => {
        navigate(section.path);
      }, 180);
    }
    if (section.action === "MODAL") {
      setShowPaymentModal(true);
    }
  };

  return (
    <main className="dashboard">
      <div className="dashboard__container">
        <div className="dashboard__header">
          <div>
            <h2 className="dashboard__title">Panel Principal</h2>
            <p className="dashboard__subtitle">
              Accesos rapidos y registro de operaciones.
            </p>
          </div>
        </div>

        <div className="dashboard__grid">
          {filteredSections.map((section) => {
            const Icon = section.icon;
            return (
              <DashboardCard
                key={section.title}
                title={section.title}
                icon={<Icon size={32} strokeWidth={1.8} />}
                description={section.description}
                buttonLabel={section.buttonLabel || "Abrir"}
                onClick={() => handleAction(section)}
              />
            );
          })}
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal onClose={() => setShowPaymentModal(false)}></PaymentModal>
      )}
    </main>
  );
};

export default Dashboard;
