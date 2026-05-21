import { useState, useEffect } from "react";
import { X } from "lucide-react";
import useClientForm from "../../hooks/useClientForm";
import PersonalDataFields from "../formClients/PersonalDataFields";
import ContactFields from "../formClients/ContactFields";
import EmergencyFields from "../formClients/EmergencyFields";
import { createClientAPI, updateClientAPI } from "../../services/clients.service";
import type { ClientForm } from "../../types/client.types";

interface Props {
  onClose: () => void;
  onSaved?: (client: ClientForm) => void;
  mode?: "create" | "edit";
  initialClient?: ClientForm | null;
}

type TabId = "personal" | "contact" | "emergency";

const TABS: { id: TabId; label: string }[] = [
  { id: "personal", label: "Datos Personales" },
  { id: "contact", label: "Contacto" },
  { id: "emergency", label: "Emergencia" },
];

const ClientModal = ({
  onClose,
  onSaved,
  mode = "create",
  initialClient = null,
}: Props) => {
  const { form, updateField, resetForm } = useClientForm();
  const [activeTab, setActiveTab] = useState<TabId>("personal");
  const isEdit = mode === "edit" && Boolean(initialClient);

  // Reset active tab when opening/closing
  useEffect(() => {
    setActiveTab("personal");
  }, []);

  useEffect(() => {
    if (!initialClient) {
      resetForm();
    }
  }, [initialClient, resetForm]);

  useEffect(() => {
    if (initialClient) {
      updateField("documentType", (initialClient as any).documentType || "CEDULA");
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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateRequiredFields()) return;

    const actionLabel = isEdit ? "actualizar" : "registrar";
    if (!confirm(`Deseas ${actionLabel} este cliente?`)) {
      return;
    }

    try {
      if (isEdit && initialClient) {
        const updated = await updateClientAPI(initialClient.id, {
          documentType: (form as any).documentType || "CEDULA",
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
        if (updated) {
          onSaved?.(updated);
        }
      } else {
        const created = await createClientAPI({
          documentType: (form as any).documentType || "CEDULA",
          documentNumber: form.documentNumber,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          email: form.email,
          address: form.address,
          emergencyContact: form.emergencyContact,
          emergencyPhone: form.emergencyPhone,
          notes: form.notes,
          memberShip: "Por registrar",
          memberShipStartDate: new Date(),
          memberShipEndDate: new Date(),
          memberShipStatus: "NONE",
          fingerPrint: false,
        });
        if (created) onSaved?.(created);
      }
      onClose();
    } catch (err) {
      console.error("Error al guardar cliente:", err);
      alert("No se pudo guardar el cliente.");
    }
  };

  return (
    <div className="client-modal-backdrop" onClick={onClose}>
      <div className="client-modal" onClick={(e) => e.stopPropagation()}>
        <div className="client-modal-header">
          <div>
            <h3>{isEdit ? "Editar cliente" : "Registrar cliente"}</h3>
            <p className="modal-subtitle">
              Completa los datos para {isEdit ? "actualizar" : "registrar"} el cliente.
            </p>
          </div>
          <button className="client-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="client-modal-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`client-modal-tab ${activeTab === tab.id ? "client-modal-tab--active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form className="client-modal-form" onSubmit={handleSubmit}>
          {activeTab === "personal" && (
            <PersonalDataFields form={form} updateField={updateField} />
          )}
          {activeTab === "contact" && (
            <ContactFields form={form} updateField={updateField} />
          )}
          {activeTab === "emergency" && (
            <EmergencyFields form={form} updateField={updateField} />
          )}

          <div className="form-buttons">
            <button className="btn-register" type="submit">
              {isEdit ? "Actualizar cliente" : "Registrar cliente"}
            </button>
            <button type="button" onClick={onClose} className="btn-register cancel">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;