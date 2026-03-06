import type { ClientForm } from "../../types/client.types";
import ClientRow from "./ClientRow";

interface Props {
  clients: ClientForm[];
}

const ClientTable = ({ clients }: Props) => {
  return (
    <div className="clients-table-wrapper">
      <table className="client-table">
        <thead>
          <tr>
            <th>N°</th>
            <th>Cédula</th>
            <th>Apellidos</th>
            <th>Nombres</th>
            <th>Membresía</th>
            <th>Estado</th>
            <th>Acciones</th>
            <th>Huella</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <ClientRow key={client.id} client={client}></ClientRow>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientTable;
