import { useEffect } from "react";
import { X } from "lucide-react";
import useClientForm from "../../hooks/useClientForm";
import PersonalDataFields from "../formClients/PersonalDataFields";
import ContactFields from "../formClients/ContactFields";
import EmergencyFields from "../formClients/EmergencyFields";
import { createClient, updateClient } from "../../services/clients.service";
import type { ClientForm } from "../../types/client.types";
import "../../styles/clientsRegister.css";

interface Props {
  onClose: () => void;
  onSaved?: (client: ClientForm) => void;
  mode?: "create" | "edit";
  initialClient?: ClientForm | null;
}

const ClientModal = ({
  onClose,
  onSaved,
  mode = "create",
  initialClient = null,
}: Props) => {
  const { form, updateField, resetForm } = useClientForm();
  const isEdit = mode === "edit" && Boolean(initialClient);

  useEffect(() => {
    if (!initialClient) {
      resetForm();
    }
  }, [initialClient, resetForm]);

  useEffect(() => {
    if (initialClient) {
      updateField("documentNumber", initialClient.documentNumber || "");
      updateField("firstName", initialClient.firstName || "");
      updateField("lastName", initialClient.lastName || "");
      updateField("phone", initialClient.phone || "");
      updateField("email", initialClient.email || "");
      updateField("address", initialClient.address || "");
      updateField("emergencyContact", initialClient.emergencyContact || "");
      updateField("emergencyPhone", initialClient.emergencyPhone || "");
      updateField("notes", initialClient.notes || "");
    }
  }, [initialClient, updateField]);

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

    const actionLabel = isEdit ? "actualizar" : "registrar";
    if (!confirm(`Deseas ${actionLabel} este cliente?`)) {
      return;
    }

    try {
      if (isEdit && initialClient) {
        const updated = updateClient(initialClient.id, {
          ...initialClient,
          documentNumber: form.documentNumber,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          email: form.email,
          address: form.address,
          emergencyContact: form.emergencyContact,
          emergencyPhone: form.emergencyPhone,
          notes: form.notes,
        });
        onSaved?.(updated);
      } else {
        const created = createClient(form);
        onSaved?.(created);
      }
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
            <h3>{isEdit ? "Editar cliente" : "Registrar cliente"}</h3>
            <p className="clients-modal-subtitle">
              Completa los datos para {isEdit ? "actualizar" : "registrar"} el
              cliente.
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
              {isEdit ? "Actualizar cliente" : "Registrar cliente"}
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
