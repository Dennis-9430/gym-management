import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useClients } from "../../hooks/useListClientsHook";
import ClientInfo from "../../components/clientProfile/ClientInfo";
import ClientStats from "../../components/clientProfile/ClientStats";
import ClientMembership from "../../components/clientProfile/ClientMembership";
import ClientPayments from "../../components/clientProfile/ClientPayments";
import ClientModal from "../../components/clients/ClientModal";
import { ArrowLeft } from "lucide-react";
import "../../styles/clientProfileCss/ClientProfile.css";
//import ClientAttendance from "../../components/clientProfile/ClientAttendance";

const ClientProfile = () => {
  const { id } = useParams();
  const { clients, reloadClients } = useClients();
  const client = clients.find((c) => c.id === Number(id));
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);

  if (!client) return <p>Cliente no encontrado</p>;
  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigate(`/clients/list`);
  };

  const handleSaved = () => {
    reloadClients();
    setShowEdit(false);
  };

  return (
    <main>
      <div className="client-profile-container">
        <div className="profile-header">
          <button className="btn-back" onClick={handleClose}>
            <ArrowLeft size={22} />
            Atras
          </button>

          <h2 className="profile-title">Perfil del Cliente</h2>
        </div>

        <div className="profile-grid">
          <ClientInfo client={client} onEdit={() => setShowEdit(true)} />

          <ClientMembership client={client} />

          <ClientStats />

          <ClientPayments />
        </div>
      </div>

      {showEdit && (
        <ClientModal
          mode="edit"
          initialClient={client}
          onClose={() => setShowEdit(false)}
          onSaved={handleSaved}
        />
      )}
    </main>
  );
};

export default ClientProfile;
