import { useState, useEffect } from "react";
import type {
  EmployeeInput,
  EmployeeRole,
  EmployeeStatus,
} from "../../types/employee.types";
import { useAccountType } from "../../hooks/useAccountType";

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
const statusOptions: EmployeeStatus[] = ["ACTIVE", "INACTIVE"];

const defaultValues: EmployeeInput = {
  username: "",
  documentType: "CEDULA",
  documentNumber: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
  password: "",
  role: "RECEPCIONISTA",
  status: "ACTIVE",
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
  const { isDemo, ownerEditableFields } = useAccountType();

  const usernameDisabled = isOwner && (isDemo || !ownerEditableFields.username);
  const emailDisabled = isOwner && (isDemo || !ownerEditableFields.email);
  const statusDisabled = isOwner;
  const roleDisabled = isOwner;
  
  const requirePasswordForNew = isNew && requirePassword;
  
  const [form, setForm] = useState<EmployeeInput>(() => {
    if (initialValues) {
      const merged: EmployeeInput = { ...defaultValues, ...initialValues };
      if (!initialValues.password) {
        merged.password = "";
      }
      return merged;
    }
    return defaultValues;
  });
  const [error, setError] = useState<string | null>(null);
  
  // Cuando initialValues cambia, actualizar el form
  useEffect(() => {
    if (initialValues) {
      const merged: EmployeeInput = { ...defaultValues, ...initialValues };
      if (!initialValues.password) {
        merged.password = "";
      }
      setForm(merged);
    } else if (form !== defaultValues) {
      setForm(defaultValues);
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

    if (requirePasswordForNew && !form.password.trim()) {
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
      {isDemo && (
        <div className="demo-notice">
          Las cuentas demo tienen acceso restringido
        </div>
      )}
      <div className="form-group ">
        <label>Cedula</label>
        <input
          value={form.documentNumber}
          onChange={(e) => updateField("documentNumber", e.target.value)}
          placeholder="Numero de cedula"
          disabled={isDemo}
        />
      </div>
      <div className="form-group">
        <label>Estado</label>
        <select
          value={form.status}
          onChange={(e) =>
            updateField("status", e.target.value as EmployeeStatus)
          }
          disabled={statusDisabled || isDemo}
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        {isOwner && !isDemo && <span className="field-hint">No editable para el owner</span>}
      </div>
      <div className="form-group">
        <label>Nombre</label>
        <input
          value={form.firstName}
          onChange={(e) => updateField("firstName", e.target.value)}
          placeholder="Nombre"
          disabled={isDemo}
        />
      </div>

      <div className="form-group">
        <label>Apellido</label>
        <input
          value={form.lastName}
          onChange={(e) => updateField("lastName", e.target.value)}
          placeholder="Apellido"
          disabled={isDemo}
        />
      </div>

      <div className="form-group">
        <label>Telefono</label>
        <input
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          placeholder="Telefono"
          disabled={isDemo}
        />
      </div>

      <div className="form-group ">
        <label>Direccion</label>
        <input
          value={form.address}
          onChange={(e) => updateField("address", e.target.value)}
          placeholder="Direccion"
          disabled={isDemo}
        />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          placeholder="correo@email.com"
          disabled={emailDisabled}
        />
        {emailDisabled && !isDemo && <span className="field-hint">No editable (dato del registro)</span>}
      </div>

      <div className="form-group ">
        <label>Usuario</label>
        <input
          value={form.username}
          onChange={(e) => updateField("username", e.target.value)}
          placeholder="Usuario"
          disabled={usernameDisabled}
        />
        {isOwner && !isDemo && !ownerEditableFields.username && (
          <span className="field-hint">No editable (dato del registro)</span>
        )}
      </div>
      <div className="form-group">
        <label>Contrasena</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
          placeholder="Contrasena"
          disabled={isDemo}
        />
      </div>

      <div className="form-group ">
        <label>Rol</label>
        <select
          value={form.role}
          onChange={(e) =>
            updateField("role", e.target.value as EmployeeRole)
          }
          disabled={roleDisabled || isDemo}
        >
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        {isOwner && !isDemo && <span className="field-hint">No editable para el owner</span>}
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="form-buttons">
        <button type="submit" className="btn-register" disabled={isDemo}>
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
