import { useParams, useNavigate } from "react-router-dom";
import { useClients } from "../../hooks/listClientsHook";
import ClientInfo from "../../components/clienteProfile/ClientInfo";
import ClientStats from "../../components/clienteProfile/ClientStats";
import ClientMembership from "../../components/clienteProfile/ClientMembership";
import ClientPayments from "../../components/clienteProfile/ClientPayments";
import { ArrowLeft } from "lucide-react";
import "../../styles/clientProfileCss/ClientProfile.css";
//import ClientAttendance from "../../components/clienteProfile/ClientAttendance";

const ClientProfile = () => {
  const { id } = useParams();
  const { clients } = useClients();
  const client = clients.find((c) => c.id === Number(id));
  const navigate = useNavigate();
  if (!client) return <p>Cliente no encontrado</p>;
  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigate(`/clients/list`);
  };
  return (
    <main>
      <div className="client-profile-container">
        <div className="profile-header">
          <button className="btn-back" onClick={handleClose}>
            <ArrowLeft size={22} />
            Atrás
          </button>

          <h2 className="profile-title">Perfil del Cliente</h2>
        </div>

        <div className="profile-grid">
          <ClientInfo client={client} />

          <ClientMembership client={client} />

          <ClientStats />

          <ClientPayments />
        </div>
      </div>
    </main>
  );
};

export default ClientProfile;
