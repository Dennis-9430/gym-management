import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { ClientForm } from "../../types/client.types";
import { getClients, updateClient } from "../../services/clients.service";
import PendingSubscriptionsList from "../../components/sales/PendingSubscriptions";
import "../../styles/pos.css";

/* Pagina de suscripciones pendientes por registrar */
const PendingSubscriptionsPage = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientForm[]>(() => getClients());

  const reloadClients = useCallback(() => setClients(getClients()), []);

  const pendingClients = clients.filter(
    (client) => client.memberShipStatus === "NONE"
  );

  const handleRegisterPayment = (client: ClientForm) => {
    navigate("/sales", { state: { openSubscriptionModal: true, client } });
  };

  const handleDeletePending = (client: ClientForm) => {
    if (!confirm("Deseas eliminar esta suscripcion pendiente?")) {
      return;
    }
    updateClient(client.id, {
      ...client,
      memberShipStatus: "EXPIRED",
    });
    reloadClients();
  };

  const handleBack = () => {
    navigate("/sales");
  };

  return (
    <main className="pos-container">
      <section className="pos-pending">
        <div className="pos-pending-header">
          <div>
            <button
              type="button"
              className="pos-card-btn primary"
              onClick={handleBack}
            >
              ← Volver
            </button>
            <h3>Suscripciones pendientes</h3>
            <p>Clientes con pagos por completar.</p>
          </div>
        </div>
        <PendingSubscriptionsList
          clients={pendingClients}
          onRegisterPayment={handleRegisterPayment}
          onDeletePending={handleDeletePending}
        />
      </section>
    </main>
  );
};

export default PendingSubscriptionsPage;
