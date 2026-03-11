import useClientForm from "../../hooks/useClientForm";
import { useNavigate, useParams } from "react-router-dom";
import { useClients } from "../../hooks/useListClientsHook";
import React, { useEffect } from "react";

import PersonalDataFields from "../../components/formClients/PersonalDataFields";
import ContactFields from "../../components/formClients/ContactFields";
import EmergencyFields from "../../components/formClients/EmergencyFields";

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("cliente", form);

    if (id) {
      navigate(`/clients/${id}`);
    } else {
      navigate("/dashboard");
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
            {id ? "Volver al perfil" : "Cancelar"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default FormClient;
