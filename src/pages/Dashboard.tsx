import { useState } from "react";
import { useAuth } from "../context/index.ts";
import { useNavigate } from "react-router-dom";
import { sections, type DashboardSection } from "../types/dashboard.section";
import { getTenantPlan } from "../services/api";
import PaymentModal from "../pages/payments/PaymentModal";
import DashboardCard from "../components/dashboard/DashboardCard";
import "../styles/dashboard.css";

/* Página principal del dashboard con accesos rápidos */
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  if (!user) return null;

  /* Obtener el plan del tenant */
  const tenantPlan = getTenantPlan();
  const isPremium = tenantPlan === "PREMIUM";

  /* Verificar si es modo demo */
  const tenantData = localStorage.getItem("tenant");
  let isDemo = false;
  let demoPlan = "";
  if (tenantData) {
    try {
      const data = JSON.parse(tenantData);
      isDemo = data.isDemo || false;
      demoPlan = data.demoPlan || "";
    } catch {}
  }

  /* Filtra las secciones según el rol y el plan */
  const filteredSections = sections.filter((section) => {
    // Filtrar por rol
    if (!section.roles.includes(user.role)) {
      return false;
    }
    
    // En modo demo, aplicar restricciones según el plan
    if (isDemo) {
      if (demoPlan === "BASIC") {
        // BASIC: solo módulos permitidos
        const basicAllowed = ["clients", "sales", "products", "attendance", "memberships"];
        if (!basicAllowed.includes(section.id)) {
          return false;
        }
      }
      // PREMIUM: permitir todo
    } else {
      // Modo normal: filtrar por plan
      if (section.plan === "PREMIUM" && !isPremium) {
        return false;
      }
    }
    
    return true;
  });

  /* Maneja la acción de cada tarjeta según su tipo */
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