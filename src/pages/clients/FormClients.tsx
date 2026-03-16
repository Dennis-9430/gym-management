import useClientForm from "../../hooks/useClientForm";
import { useNavigate, useParams } from "react-router-dom";
import { useClients } from "../../hooks/useListClientsHook";
import React, { useEffect } from "react";

import PersonalDataFields from "../../components/formClients/PersonalDataFields";
import ContactFields from "../../components/formClients/ContactFields";
import EmergencyFields from "../../components/formClients/EmergencyFields";
import { createClient, updateClient } from "../../services/clients.service";

import "../../styles/clientsRegister.css";

const FormClient = () => {
  const { form, updateField } = useClientForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const { clients } = useClients();

  const clientToEdit = clients.find((c) => c.id === Number(id));

  useEffect(() => {
    if (clientToEdit) {
      updateField("documentNumber", clientToEdit.documentNumber || "");
      updateField("firstName", clientToEdit.firstName || "");
      updateField("lastName", clientToEdit.lastName || "");
      updateField("phone", clientToEdit.phone || "");
      updateField("email", clientToEdit.email || "");
      updateField("address", clientToEdit.address || "");
      updateField("emergencyContact", clientToEdit.emergencyContact || "");
      updateField("emergencyPhone", clientToEdit.emergencyPhone || "");
      updateField("notes", clientToEdit.notes || "");
    }
  }, [clientToEdit, updateField]);

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

    const actionLabel = id ? "actualizar" : "registrar";
    if (!confirm(`Deseas ${actionLabel} este cliente?`)) {
      return;
    }

    try {
      if (id && clientToEdit) {
        updateClient(clientToEdit.id, {
          ...clientToEdit,
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
        navigate(`/clients/${id}`);
      } else {
        const created = createClient(form);
        navigate(`/clients/${created.id}`);
      }
    } catch {
      alert("No se pudo guardar el cliente.");
    }
  };

  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (id) {
      navigate(`/clients/${id}`);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <main className="register-container">
      <div className="register-card">
        <h2>{id ? "Editar cliente" : "Registrar cliente"}</h2>

        <form className="register-form" onSubmit={handleSubmit}>
          <PersonalDataFields form={form} updateField={updateField} />

          <ContactFields form={form} updateField={updateField} />

          <EmergencyFields form={form} updateField={updateField} />

          <button className="btn-register" type="submit">
            {id ? "Actualizar cliente" : "Registrar cliente"}
          </button>

          <button type="button" onClick={handleClose} className="btn-register">
            Cancelar
          </button>
        </form>
      </div>
    </main>
  );
};

export default FormClient;
