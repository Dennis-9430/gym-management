import { useParams } from "react-router-dom";
import { useClients } from "../../hooks/listClientsHook";
import ClientInfo from "../../components/clienteProfile/ClientInfo";
import ClientStats from "../../components/clienteProfile/ClientStats";
import ClientMembership from "../../components/clienteProfile/ClientMembership";
import ClientPayments from "../../components/clienteProfile/ClientPayments";
//import ClientAttendance from "../../components/clienteProfile/ClientAttendance";

const ClientProfile = () => {
  const { id } = useParams();
  const { clients } = useClients();
  const client = clients.find((c) => c.id === Number(id));

  if (!client) return <p>Cliente no encontrado</p>;

  return (
    <div className="client-profile-container">
      <h2 className="profile-title">Perfil del Cliente</h2>

      <div className="profile-grid">
        <ClientInfo client={client} />

        <ClientMembership client={client} />

        <ClientStats />

        <ClientPayments />
      </div>
    </div>
  );
};

export default ClientProfile;
