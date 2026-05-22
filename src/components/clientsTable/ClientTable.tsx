import type { ClientForm } from "../../types/client.types";
import ClientRow from "./ClientRow";
import { useAccountType } from "../../hooks/useAccountType";
import { useAuth } from "../../context";

/* Tabla de clientes con ordenamiento y estadisticas */
interface Props {
  clients: ClientForm[];
  totalClients: number;
  activeClients: number;
  sortBy: (field: keyof ClientForm) => void;
  sortField: keyof ClientForm | null;
  sortDirection: "asc" | "desc";
  showActions: boolean;
  onDelete?: (clientId: number | string) => void;
  biometricEnabled?: boolean;
  onRegisterFingerprint?: (clientId: number | string) => void;
  onDeleteFingerprint?: (clientId: number | string) => void;
}

const ClientTable = ({
  clients,
  totalClients,
  activeClients,
  sortBy,
  sortField,
  sortDirection,
  showActions,
  onDelete,
  biometricEnabled = false,
  onRegisterFingerprint,
  onDeleteFingerprint,
}: Props) => {
  const { isOwner } = useAccountType();
  const { user } = useAuth();

  // Gerente y Admin pueden eliminar clientes
  // Recepcionista NO puede eliminar clientes
  const canDelete = isOwner || user?.role === "ADMIN";

  const renderSortIcon = (field: keyof ClientForm) => {
    if (sortField !== field) {
      return <span className="sort-icon">&#9660; &#9650;</span>;
    }
    return sortDirection === "asc" ? (
      <span className="sort-icon active">&#9650;</span>
    ) : (
      <span className="sort-icon active">&#9660;</span>
    );
  };

  const renderHeader = (label: string, field: keyof ClientForm) => {
    return (
      <th onClick={() => sortBy(field)} className="sortable">
        {label} {renderSortIcon(field)}
      </th>
    );
  };

  return (
    <div className="client-table-wrapper">
      <div className="clients-stats">
        Usuarios: {totalClients} | Activos: {activeClients}
      </div>
      <table className="client-table">
        <thead>
          <tr>
            <th>N°</th>
            <th>Cedula</th>
            {renderHeader("Apellidos", "lastName")}
            {renderHeader("Nombres", "firstName")}
            <th>Expiracion</th>
            {biometricEnabled && <th>Huella</th>}
            {showActions && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {clients.map((client, index) => (
            <ClientRow
              key={client.id}
              client={client}
              index={index}
              showActions={showActions}
              canDelete={canDelete}
              onDelete={onDelete}
              biometricEnabled={biometricEnabled}
              onRegisterFingerprint={onRegisterFingerprint}
              onDeleteFingerprint={onDeleteFingerprint}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientTable;
