import { useNavigate } from "react-router-dom";
import type { ClientForm } from "../../types/client.types";
import { Fingerprint, RefreshCcw, Trash2, BadgeCheck } from "lucide-react";
import { updateClient } from "../../services/clients.service";

interface Props {
  client: ClientForm;
  showActions: boolean;
  onRefresh: () => void;
}

const ClientRow = ({ client, showActions, onRefresh }: Props) => {
  const navigate = useNavigate();
  const gotoProfile = () => {
    navigate(`/clients/${client.id}`);
  };
  const registerFingerPrint = () => {
    if (client.memberShipStatus !== "ACTIVE") {
      return;
    }
    console.log("Registrar huella", client.id);
  };
  const removeFingerPrint = () => {
    console.log("Eliminar huella", client.id);
  };

  const handleRenew = () => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 30);
    updateClient(client.id, {
      ...client,
      memberShipStatus: "ACTIVE",
      memberShip: client.memberShip || "Mensual",
      memberShipStartDate: start,
      memberShipEndDate: end,
    });
    onRefresh();
  };

  const handleRegisterSubscription = () => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 30);
    updateClient(client.id, {
      ...client,
      memberShipStatus: "ACTIVE",
      memberShip: "Mensual",
      memberShipStartDate: start,
      memberShipEndDate: end,
    });
    onRefresh();
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
              Eliminar
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={
              allowFingerprint ? "btn-fingerprint-add" : "btn-fingerprint-disabled"
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
              onClick={handleRegisterSubscription}
            >
              <BadgeCheck size={18} /> Registrar suscripcion
            </button>
          ) : (
            <button type="button" className="btn-renew" onClick={handleRenew}>
              <RefreshCcw size={18} /> Renovar
            </button>
          )}
        </td>
      )}
    </tr>
  );
};
export default ClientRow;
