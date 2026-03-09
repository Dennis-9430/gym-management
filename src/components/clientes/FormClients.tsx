import useClientForm from "../../reducers/useClientForm";
import { useNavigate, useParams } from "react-router-dom";
import { useClients } from "../../hooks/listClientsHook";
import React, { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import "../../styles/clientsRegister.css";

const FormClient = () => {
  const { form, updateField, resetForm } = useClientForm();
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
  }, [clientToEdit]);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("cliente", form);
    if (id) {
      // si está editando
      navigate(`/clients/${id}`);
    } else {
      // si está registrando
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
          <div className="form-group full-width">
            <label>Número de Cédula </label>
            <input
              placeholder="Número cédula"
              value={form.documentNumber}
              onChange={(e) => updateField("documentNumber", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Nombres</label>
            <input
              placeholder="Nombres"
              value={form.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Apellidos</label>
            <input
              placeholder="Apellidos"
              value={form.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
            />
          </div>

          <div className="form-group full-width">
            <label>Dirección Domiciliaria</label>
            <input
              placeholder="Dirección del domicilio"
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="correo@email.com"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Télefono</label>
            <input
              placeholder="Teléfono"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Contacto de Emergencia</label>
            <input
              placeholder="Nombre del contacto"
              value={form.emergencyContact}
              onChange={(e) => updateField("emergencyContact", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Teléfono Emergencia</label>
            <input
              placeholder="Número teléfonico"
              value={form.emergencyPhone}
              onChange={(e) => updateField("emergencyPhone", e.target.value)}
            />
          </div>

          <div className="form-group full-width">
            <label>Observaciones</label>
            <textarea
              placeholder="Observaciones"
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
            />
          </div>

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
