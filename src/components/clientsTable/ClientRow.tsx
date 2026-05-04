import { useNavigate } from "react-router-dom";
import type { ClientForm } from "../../types/client.types";
import { UserPlus, BadgePlus, Trash2 } from "lucide-react";

/* Fila de cliente con acciones de perfil y suscripcion */
interface Props {
  client: ClientForm;
  showActions: boolean;
  canDelete?: boolean;
  onDelete?: (clientId: number) => void;
}

const ClientRow = ({ client, showActions, canDelete, onDelete }: Props) => {
  const navigate = useNavigate();
  const gotoProfile = () => {
    navigate(`/clients/${client.id}`);
  };

  const handleOpenSubscription = () => {
    navigate("/sales", { state: { openSubscriptionModal: true, client } });
  };

  const handleDelete = () => {
    if (confirm("¿Deseas eliminar este cliente?")) {
      onDelete?.(client.id);
    }
  };

  return (
    <tr>
      <td>{client.id} </td>
      <td
        className="client-link"
        onClick={gotoProfile}
        style={{ cursor: "pointer", color: "blue" }}
      >
        {client.documentNumber}
      </td>
      <td>{client.lastName}</td>
      <td> {client.firstName}</td>

      <td>{client.memberShipEndDate.toLocaleDateString()}</td>
      {showActions && (
        <td className="actions">
          {client.memberShipStatus === "NONE" ? (
            <button
              type="button"
              className="btn-renew"
              onClick={handleOpenSubscription}
            >
              <UserPlus size={18} /> Registrar suscripcion
            </button>
          ) : client.memberShipStatus === "EXPIRED" ? (
            <button
              type="button"
              className="btn-renew"
              onClick={handleOpenSubscription}
            >
              <BadgePlus size={18} /> Renovar
            </button>
          ) : null}
          {canDelete && (
            <button
              type="button"
              className="btn-delete"
              onClick={handleDelete}
            >
              <Trash2 size={16} />
              Eliminar
            </button>
          )}
        </td>
      )}
    </tr>
  );
};
export default ClientRow;
