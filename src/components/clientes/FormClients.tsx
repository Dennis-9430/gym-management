import useClientForm from "../../reducers/useClientForm";
import { useParams } from "react-router-dom";
import { useClients } from "../../hooks/listClientsHook";
import "../../styles/clientsRegister.css";
import { useEffect } from "react";

const FormClient = () => {
  const { form, updateField, resetForm } = useClientForm();
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
        </form>
      </div>
    </main>
  );
};

export default FormClient;
