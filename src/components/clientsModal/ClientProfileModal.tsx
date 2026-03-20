import type { ClientForm } from "../../types/client.types";
import ClientInfo from "../clientProfile/ClientInfo";
import ClientMembership from "../clientProfile/ClientMembership";
import ClientStats from "../clientProfile/ClientStats";
import ClientPayments from "../clientProfile/ClientPayments";
import { X } from "lucide-react";
import "../../styles/clientProfileCss/ClientProfile.css";

interface Props {
  client: ClientForm;
  onClose: () => void;
}

const ClientProfileModal = ({ client, onClose }: Props) => {
  return (
    <div className="client-modal-backdrop" onClick={onClose}>
      <div
        className="client-profile-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="client-modal-header">
          <div>
            <h3>Perfil del cliente</h3>
            <p className="clients-modal-subtitle">
              Informacion completa del usuario.
            </p>
          </div>
          <button className="client-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="profile-grid">
          <ClientInfo
            client={client}
            onEdit={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
          <ClientMembership client={client} />
          <ClientStats client={client} />
          <ClientPayments />
        </div>
      </div>
    </div>
  );
};

export default ClientProfileModal;
