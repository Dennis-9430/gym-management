import { useState, useEffect } from "react";
import { useAuth } from "../../context";
import type { ClientProps } from "../../types/client.types";
import { useAccountType } from "../../hooks/useAccountType";
import { buildUrl, getAuthHeaders } from "../../services/api";

/* Muestra informacion personal y de membresia del cliente */
interface Props extends ClientProps {
  onEdit: () => void;
}

const ClientInfo = ({ client, onEdit }: Props) => {
  const { user } = useAuth();
  const { isOwner } = useAccountType();
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    fetch(buildUrl("/api/fingerprints/biometric-config"), {
      headers: { ...getAuthHeaders() },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => setBiometricEnabled(d.biometricEnabled))
      .catch(() => {});
  }, []);

  // Gerente y Admin pueden editar clientes
  // Recepcionista NO puede editar clientes
  const canEdit = isOwner || user?.role === "ADMIN";

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
      {biometricEnabled && (
        <p>
          <strong>Huella:</strong>{" "}
          {client.fingerPrint ? "✅ Registrada" : "❌ Sin registrar"}
        </p>
      )}
      {canEdit && (
        <button className="btn-edit" onClick={onEdit}>
          Editar informacion
        </button>
      )}

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
