import { useNavigate } from "react-router-dom";
import type { ClientForm } from "../../types/client.types";

interface Props {
  client: ClientForm;
}

const ClientRow = ({ client }: Props) => {
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
  const editClient = () => {
    navigate(`/clietns/edit/${client.id}`);
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

      <td>{client.memberShip}</td>
      <td className="status">{client.memberShipStatus}</td>
      <td className="actions">
        <button className="btn-renew" onClick={renewMembership}>
          Renovar
        </button>
        <button className="btn-edit" onClick={editClient}>
          Editar
        </button>
      </td>
      <td>
        <button className="btn-fingerprint" onClick={registerFingerPrint}>
          Huella
        </button>
      </td>
    </tr>
  );
};
export default ClientRow;
