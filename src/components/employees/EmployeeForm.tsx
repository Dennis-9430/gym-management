import { useState, useMemo } from "react";
import type {
  EmployeeInput,
  EmployeeRole,
  EmployeeStatus,
} from "../../types/employee.types";

/* Formulario para crear o editar empleados */
interface Props {
  idValue?: number | null;
  initialValues?: EmployeeInput;
  onSubmit: (values: EmployeeInput) => void;
  onCancel?: () => void;
  submitLabel?: string;
  requirePassword?: boolean;
  isOwner?: boolean;
  isNew?: boolean;
}

const roleOptions: EmployeeRole[] = ["ADMIN", "RECEPCIONISTA"];
const statusOptions: EmployeeStatus[] = ["ACTIVO", "INACTIVO"];

const defaultValues: EmployeeInput = {
  username: "",
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
  isOwner = false,
  isNew = true,
}: Props) => {
  const initialForm = useMemo(
    () => (initialValues ? { ...defaultValues, ...initialValues } : defaultValues),
    [initialValues],
  );
  const [form, setForm] = useState<EmployeeInput>(initialForm);
  const [error, setError] = useState<string | null>(null);

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

    if (!form.username.trim()) {
      setError("El usuario es obligatorio");
      return;
    }

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
      username: form.username.trim(),
      email: form.email.trim(),
    });
  };

  return (
    <form className="employee-modal-form" onSubmit={handleSubmit}>
      <div className="form-group ">
        <label>Cedula</label>
        <input
          value={form.documentNumber}
          onChange={(e) => updateField("documentNumber", e.target.value)}
          placeholder="Numero de cedula"
        />
      </div>
      <div className="form-group">
        <label>Estado</label>
        <select
          value={form.status}
          onChange={(e) =>
            updateField("status", e.target.value as EmployeeStatus)
          }
          disabled={isOwner}
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
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

      <div className="form-group ">
        <label>Direccion</label>
        <input
          value={form.address}
          onChange={(e) => updateField("address", e.target.value)}
          placeholder="Direccion"
        />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          placeholder="correo@email.com"
          disabled={isOwner}
        />
      </div>

      <div className="form-group ">
        <label>Usuario</label>
        <input
          value={form.username}
          onChange={(e) => updateField("username", e.target.value)}
          placeholder="Usuario"
          disabled={!isNew}
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

      <div className="form-group ">
        <label>Rol</label>
        <select
          value={form.role}
          onChange={(e) =>
            updateField("role", e.target.value as EmployeeRole)
          }
          disabled={isOwner}
        >
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="form-buttons">
        <button type="submit" className="btn-register">
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-register cancel">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

export default EmployeeForm;
