import { useEffect, useState } from "react";
import type { EmployeeInput, EmployeeRole, EmployeeStatus } from "../../types/employee.types";

interface Props {
  initialValues?: EmployeeInput;
  onSubmit: (values: EmployeeInput) => void;
  onCancel?: () => void;
  submitLabel?: string;
  requirePassword?: boolean;
}

const roleOptions: EmployeeRole[] = ["ADMIN", "RECEPCIONISTA", "ENTRENADOR"];
const statusOptions: EmployeeStatus[] = ["ACTIVO", "INACTIVO"];

const defaultValues: EmployeeInput = {
  documentNumber: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
  password: "",
  role: "RECEPCIONISTA",
  status: "ACTIVO",
};

const EmployeeForm = ({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Guardar",
  requirePassword = true,
}: Props) => {
  const [form, setForm] = useState<EmployeeInput>(
    initialValues ? { ...defaultValues, ...initialValues } : defaultValues,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialValues) {
      setForm({ ...defaultValues, ...initialValues });
    }
  }, [initialValues]);

  const updateField = <K extends keyof EmployeeInput>(
    field: K,
    value: EmployeeInput[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("Nombre y apellido son obligatorios");
      return;
    }

    if (!form.email.trim()) {
      setError("El email es obligatorio");
      return;
    }

    if (requirePassword && !form.password.trim()) {
      setError("La contrasena es obligatoria");
      return;
    }

    onSubmit({
      ...form,
      email: form.email.trim(),
    });
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <div className="form-group full-width">
        <label>Numero de Cedula</label>
        <input
          placeholder="Numero de cedula"
          value={form.documentNumber}
          onChange={(e) => updateField("documentNumber", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Nombre</label>
        <input
          value={form.firstName}
          onChange={(e) => updateField("firstName", e.target.value)}
          placeholder="Nombre"
        />
      </div>

      <div className="form-group">
        <label>Apellido</label>
        <input
          value={form.lastName}
          onChange={(e) => updateField("lastName", e.target.value)}
          placeholder="Apellido"
        />
      </div>

      <div className="form-group">
        <label>Telefono</label>
        <input
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          placeholder="Telefono"
        />
      </div>

      <div className="form-group full-width">
        <label>Direccion</label>
        <input
          value={form.address}
          onChange={(e) => updateField("address", e.target.value)}
          placeholder="Direccion"
        />
      </div>

      <div className="form-group full-width">
        <label>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          placeholder="correo@email.com"
        />
      </div>

      <div className="form-group">
        <label>Contrasena</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
          placeholder="Contrasena"
        />
      </div>

      <div className="form-group">
        <label>Rol</label>
        <select
          value={form.role}
          onChange={(e) => updateField("role", e.target.value as EmployeeRole)}
        >
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Estado</label>
        <select
          value={form.status}
          onChange={(e) =>
            updateField("status", e.target.value as EmployeeStatus)
          }
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group full-width">
        <label>Observaciones</label>
        <textarea
          value={form.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          placeholder="Observaciones"
        />
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="form-buttons">
        <button type="submit" className="btn-register">
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-register"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

export default EmployeeForm;
