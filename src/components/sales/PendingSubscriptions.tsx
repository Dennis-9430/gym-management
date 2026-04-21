import type { ClientForm } from "../../types/client.types";

/* Componente que muestra membresías pendientes */
interface PendingSubscriptionsProps {
  clients: ClientForm[];
  onRegisterPayment: (client: ClientForm) => void;
  onDeletePending: (client: ClientForm) => void;
}

const PendingSubscriptions = ({
  clients,
  onRegisterPayment,
  onDeletePending,
}: PendingSubscriptionsProps) => {
  return (
    <div className="pos-pending-table-wrapper">
      <table className="pos-pending-table">
        <thead>
          <tr>
            <th>Cedula</th>
            <th>Cliente</th>
            <th>Estado membresia</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clients.length === 0 ? (
            <tr>
              <td colSpan={4} className="pos-empty-row">
                No hay suscripciones pendientes.
              </td>
            </tr>
          ) : (
            clients.map((client) => (
              <tr key={client.id}>
                <td>{client.documentNumber}</td>
                <td>
                  {client.firstName} {client.lastName}
                </td>
                <td>Pendiente</td>
                <td>
                  <div className="pos-table-actions">
                    <button
                      type="button"
                      className="pos-action-btn primary"
                      onClick={() => onRegisterPayment(client)}
                    >
                      Registrar pago
                    </button>
                    <button
                      type="button"
                      className="pos-action-btn danger"
                      onClick={() => onDeletePending(client)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PendingSubscriptions;
