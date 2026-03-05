import type React from "react";
import useClientForm from "../hooks/useClientForm";
import "../styles/clientsRegister.css";

const ClientForm = () => {
  const { form, updateField, resetForm } = useClientForm();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("cliente", form);
    resetForm();
  };
  return (
    <main className="register-container">
      <div className="register-card">
        <h2>Registrar cliente</h2>
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
              placeholder="Obserbaciones"
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
            />
          </div>

          <button className="btn-register" type="submit">
            Registrar Cliente
          </button>
        </form>
      </div>
    </main>
  );
};

export default ClientForm;
