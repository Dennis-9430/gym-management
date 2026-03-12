import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { sections } from "../types/dashboard.section";
import PaymentModal from "../pages/payments/PaymentModal";
import ClientModal from "../components/clients/ClientModal";
import "../styles/dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  if (!user) return null;
  const filteredSections = sections.filter((section) =>
    section.roles.includes(user.role),
  );
  const handleAccess = (section: any) => {
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
          <button
            className="dashboard__add-client"
            onClick={() => setShowClientModal(true)}
          >
            <Plus size={18} />
            Registrar cliente
          </button>
        </div>

        <div className="dashboard__grid">
          {filteredSections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                className="dashboard__card"
                key={section.title}
                onClick={() => handleAccess(section)}
                role="button"
                tabIndex={0}
              >
                <div className="dashboard__icon">
                  <Icon size={42} strokeWidth={1.8}></Icon>
                </div>
                <h3 className="dashboard__card-title">{section.title}</h3>
              </div>
            );
          })}
        </div>
      </div>
      {showPaymentModal && (
        <PaymentModal onClose={() => setShowPaymentModal(false)}></PaymentModal>
      )}
      {showClientModal && (
        <ClientModal onClose={() => setShowClientModal(false)} />
      )}
    </main>
  );
};

export default Dashboard;
