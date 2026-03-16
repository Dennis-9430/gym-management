import type { ClientProps } from "../../types/client.types";

interface Props extends ClientProps {
  onEdit: () => void;
}

const ClientInfo = ({ client, onEdit }: Props) => {
  return (
    <div className="card card-info">
      <h3>Informacion Personal</h3>

      <p>
        <strong>Cedula:</strong> {client.documentNumber}
      </p>
      <p>
        <strong>Nombre:</strong> {client.firstName} {client.lastName}
      </p>
      <p>
        <strong>Telefono:</strong> {client.phone}
      </p>
      <p>
        <strong>Email:</strong> {client.email}
      </p>
      <p>
        <strong>Direccion:</strong> {client.address}
      </p>
      <p>
        <strong>Observaciones:</strong> {client.notes}
      </p>
      <p>
        <strong>Contacto de Emergencia</strong> {client.emergencyContact}
      </p>
      <p>
        <strong>Telefono de Emergencia</strong> {client.emergencyPhone}
      </p>
      <button className="btn-edit" onClick={onEdit}>
        Editar informacion
      </button>
    </div>
  );
};
export default ClientInfo;
