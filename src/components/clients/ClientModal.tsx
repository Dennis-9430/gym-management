import { useEffect } from "react";
import { X } from "lucide-react";
import useClientForm from "../../hooks/useClientForm";
import PersonalDataFields from "../formClients/PersonalDataFields";
import ContactFields from "../formClients/ContactFields";
import EmergencyFields from "../formClients/EmergencyFields";
import { createClient } from "../../services/clients.service";
import type { ClientForm } from "../../types/client.types";
import "../../styles/clientsRegister.css";

interface Props {
  onClose: () => void;
  onCreated?: (client: ClientForm) => void;
}

const ClientModal = ({ onClose, onCreated }: Props) => {
  const { form, updateField, resetForm } = useClientForm();

  useEffect(() => {
    resetForm();
  }, [resetForm]);

  const validateRequiredFields = () => {
    const missing: string[] = [];
    if (!form.documentNumber?.trim()) missing.push("documento");
    if (!form.firstName?.trim()) missing.push("nombres");
    if (!form.lastName?.trim()) missing.push("apellidos");
    if (!form.phone?.trim()) missing.push("telefono");
    if (!form.email?.trim()) missing.push("email");
    if (!form.address?.trim()) missing.push("direccion");

    if (missing.length) {
      alert(`Completa los campos obligatorios: ${missing.join(", ")}`);
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateRequiredFields()) return;

    if (!confirm("Deseas registrar este cliente?")) {
      return;
    }

    try {
      const created = createClient(form);
      onCreated?.(created);
      onClose();
    } catch {
      alert("No se pudo guardar el cliente.");
    }
  };

  return (
    <div className="client-modal-backdrop" onClick={onClose}>
      <div className="client-modal" onClick={(e) => e.stopPropagation()}>
        <div className="client-modal-header">
          <div>
            <h3>Registrar cliente</h3>
            <p className="clients-modal-subtitle">
              Completa los datos para registrar el cliente.
            </p>
          </div>
          <button className="client-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          <PersonalDataFields form={form} updateField={updateField} />
          <ContactFields form={form} updateField={updateField} />
          <EmergencyFields form={form} updateField={updateField} />

          <div className="form-buttons">
            <button className="btn-register" type="submit">
              Registrar cliente
            </button>
            <button type="button" onClick={onClose} className="btn-register">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;
