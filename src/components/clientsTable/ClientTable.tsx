import type { ClientForm } from "../../types/client.types";
import ClientRow from "./ClientRow";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
interface Props {
  clients: ClientForm[];
  totalClients: number;
  activeClients: number;
  sortBy: (field: keyof ClientForm) => void;
  sortField: keyof ClientForm | null;
  sortDirection: "asc" | "desc";
  showActions: boolean;
}

const ClientTable = ({
  clients,
  totalClients,
  activeClients,
  sortBy,
  sortField,
  sortDirection,
  showActions,
}: Props) => {
  const renderSortIcon = (field: keyof ClientForm) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="sort icon" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp size={14} className="sort-icon active" />
    ) : (
      <ArrowDown size={14} className="sort-icon active" />
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
            <th>N�</th>
            <th>Cedula</th>
            {renderHeader("Apellidos", "lastName")}
            {renderHeader("Nombres", "firstName")}
            <th>Expiracion</th>
            <th>Huella</th>
            {showActions && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <ClientRow
              key={client.id}
              client={client}
              showActions={showActions}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientTable;
