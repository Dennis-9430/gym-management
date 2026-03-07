import { useNavigate } from "react-router-dom";
import type { ClientProps } from "../../types/client.types";
import { getDaysRemaining } from "../../helper/membership";
import { Fingerprint, RefreshCcw } from "lucide-react";

const ClientRow = ({ client }: ClientProps) => {
  const daysRemaining = getDaysRemaining(client.memberShipEndDate);

  const navigate = useNavigate();
  const gotoProfile = () => {
    navigate(`/clients/${client.id}`);
  };
  const registerFingerPrint = () => {
    console.log("Registrar huella", client.id);
  };
  const renewMembership = () => {
    console.log("Renovar membresia", client.id);
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

      <td>
        {client.memberShip} <br />
        {client.memberShipStartDate.toLocaleDateString()} -{"> "}
        {client.memberShipEndDate.toLocaleDateString()}
      </td>
      <td className="status">
        {daysRemaining <= 0
          ? "EXPIRE"
          : daysRemaining <= 5
            ? `${daysRemaining} días`
            : "ACTIVE"}
      </td>
      <td className="actions">
        <button className="btn-renew" onClick={renewMembership}>
          <RefreshCcw size={20} /> Renovar
        </button>
      </td>
      <td>
        <button
          className={
            client.fingerPrint
              ? "btn-fingerprint-remove"
              : "btn-fingerprint-add"
          }
          onClick={registerFingerPrint}
        >
          <Fingerprint size={20} />

          {client.fingerPrint ? "Eliminar" : "Registrar"}
        </button>
      </td>
    </tr>
  );
};
export default ClientRow;
