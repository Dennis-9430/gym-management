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

      {(client.memberShip || client.memberShipStartDate || client.memberShipEndDate) && (
        <>
          <hr className="profile-divider" />
          <div className="card-membership-inline">
            {client.memberShip && (
              <p>
                <strong>Membresia:</strong> {client.memberShip}
              </p>
            )}
            {client.memberShipStartDate && (
              <p>
                <strong>Fecha de inicio:</strong>{" "}
                {new Date(client.memberShipStartDate).toLocaleDateString()}
              </p>
            )}
            {client.memberShipEndDate && (
              <p>
                <strong>Fecha de fin:</strong>{" "}
                {new Date(client.memberShipEndDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};
export default ClientInfo;
