import { useNavigate } from "react-router-dom";
import type { ClientForm } from "../../types/client.types";
import { Fingerprint, Trash2, BadgePlus, UserPlus } from "lucide-react";

/* Fila de cliente con acciones de perfil, huella y suscripcion */
interface Props {
  client: ClientForm;
  showActions: boolean;
}

const ClientRow = ({ client, showActions }: Props) => {
  const navigate = useNavigate();
  const gotoProfile = () => {
    navigate(`/clients/${client.id}`);
  };
  const registerFingerPrint = () => {
    if (client.memberShipStatus !== "ACTIVE") {
      return;
    }
  };
  const removeFingerPrint = () => {};

  const handleOpenSubscription = () => {
    navigate("/sales", { state: { openSubscriptionModal: true, client } });
  };

  const allowFingerprint = client.memberShipStatus === "ACTIVE";

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
      <td>
        {client.fingerPrint ? (
          <div className="fingerprint-status">
            <span>Huella registrada</span>
            <button
              type="button"
              className="btn-fingerprint-remove"
              onClick={removeFingerPrint}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={
              allowFingerprint
                ? "btn-fingerprint-add"
                : "btn-fingerprint-disabled"
            }
            onClick={registerFingerPrint}
            disabled={!allowFingerprint}
          >
            <Fingerprint size={18} />
            Registrar
          </button>
        )}
        {!allowFingerprint && !client.fingerPrint && (
          <span className="fingerprint-hint">Requiere suscripcion</span>
        )}
      </td>
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
        </td>
      )}
    </tr>
  );
};
export default ClientRow;
