import type { ClientProps } from "../../types/client.types";
import { useNavigate } from "react-router-dom";

const ClientInfo = ({ client }: ClientProps) => {
  const navigate = useNavigate();
  const handleEdit = () => {
    navigate(`/clients/edit/${client.id}`);
  };
  return (
    <div className="card card-info">
      <h3>Información Personal</h3>

      <p>
        <strong>Cédula:</strong> {client.documentNumber}
      </p>
      <p>
        <strong>Nombre:</strong> {client.firstName} {client.lastName}
      </p>
      <p>
        <strong>Teléfono:</strong> {client.phone}
      </p>
      <p>
        <strong>Email:</strong> {client.email}
      </p>
      <p>
        <strong>Dirección:</strong> {client.address}
      </p>
      <p>
        <strong>Observaciones:</strong> {client.notes}
      </p>
      <p>
        <strong>Contacto de Emergencia</strong> {client.emergencyContact}
      </p>
      <p>
        <strong>Teléfono de Emergencia</strong> {client.emergencyPhone}
      </p>
      <button className="btn-edit" onClick={handleEdit}>
        Editar información
      </button>
    </div>
  );
};
export default ClientInfo;
