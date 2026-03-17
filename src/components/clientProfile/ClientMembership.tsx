import type { ClientProps } from "../../types/client.types";

const ClientMembership = ({ client }: ClientProps) => {
  return (
    <div className="card">
      <h3>Membresía</h3>
      <p>
        <strong>Plan:</strong> {client.memberShip}
      </p>
      <p>
        <strong>Inicio:</strong>{" "}
        {client.memberShipStartDate.toLocaleDateString()}
      </p>
      <p>
        <strong>Fin:</strong> {client.memberShipEndDate.toLocaleDateString()}
      </p>
      <p>
        <strong>Estado:</strong> {client.memberShipStatus}
      </p>
    </div>
  );
};

export default ClientMembership;
