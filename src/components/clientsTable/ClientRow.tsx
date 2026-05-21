import { useNavigate } from "react-router-dom";
import type { ClientForm } from "../../types/client.types";
import { UserPlus, BadgePlus, Trash2 } from "lucide-react";

/* Fila de cliente con acciones de perfil y suscripcion */
interface Props {
  client: ClientForm;
  index: number;
  showActions: boolean;
  canDelete?: boolean;
  onDelete?: (clientId: number | string) => void;
}

const ClientRow = ({ client, index, showActions, canDelete, onDelete }: Props) => {
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

  const formatDate = (date: any) => {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
  };

  return (
    <tr>
      <td data-label="N°">{index + 1}</td>
      <td
        data-label="Cédula"
        className="client-link"
        onClick={gotoProfile}
        style={{ cursor: "pointer", color: "blue" }}
      >
        {client.documentNumber}
      </td>
      <td data-label="Apellidos">{client.lastName}</td>
      <td data-label="Nombres"> {client.firstName}</td>

      <td data-label="Expiracion">{formatDate(client.memberShipEndDate)}</td>
      {showActions && (
        <td data-label="Acciones" className="actions">
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
