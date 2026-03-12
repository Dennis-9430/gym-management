import { useEffect, useState } from "react";
import { User, IdCard, Mail, Phone, MapPin, Lock, Shield } from "lucide-react";
import type {
  EmployeeInput,
  EmployeeRole,
  EmployeeStatus,
} from "../../types/employee.types";

interface Props {
  idValue?: number | null;
  initialValues?: EmployeeInput;
  onSubmit: (values: EmployeeInput) => void;
  onCancel?: () => void;
  submitLabel?: string;
  requirePassword?: boolean;
}

const roleOptions: EmployeeRole[] = ["ADMIN", "RECEPCIONISTA", "ENTRENADOR"];
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
    <form className="register-form employee-form" onSubmit={handleSubmit}>
      <div className="form-group ">
        <label>Cedula</label>
        <div className="input-with-icon">
          <IdCard size={16} />
          <input
            value={form.documentNumber}
            onChange={(e) => updateField("documentNumber", e.target.value)}
            placeholder="Numero de cedula"
          />
        </div>
      </div>
      <div className="form-group">
        <label>Estado</label>
        <div className="input-with-icon">
          <Shield size={16} />
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
      </div>
      <div className="form-group">
        <label>Nombre</label>
        <div className="input-with-icon">
          <User size={16} />
          <input
            value={form.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
            placeholder="Nombre"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Apellido</label>
        <div className="input-with-icon">
          <User size={16} />
          <input
            value={form.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
            placeholder="Apellido"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Telefono</label>
        <div className="input-with-icon">
          <Phone size={16} />
          <input
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="Telefono"
          />
        </div>
      </div>

      <div className="form-group ">
        <label>Direccion</label>
        <div className="input-with-icon">
          <MapPin size={16} />
          <input
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
            placeholder="Direccion"
          />
        </div>
      </div>
      <div className="form-group">
        <label>Email</label>
        <div className="input-with-icon">
          <Mail size={16} />
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="correo@email.com"
          />
        </div>
      </div>

      <div className="form-group ">
        <label>Usuario</label>
        <div className="input-with-icon">
          <User size={16} />
          <input
            value={form.username}
            onChange={(e) => updateField("username", e.target.value)}
            placeholder="Usuario"
          />
        </div>
      </div>
      <div className="form-group">
        <label>Contrasena</label>
        <div className="input-with-icon">
          <Lock size={16} />
          <input
            type="password"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            placeholder="Contrasena"
          />
        </div>
      </div>

      <div className="form-group ">
        <label>Rol</label>
        <div className="input-with-icon">
          <Shield size={16} />
          <select
            value={form.role}
            onChange={(e) =>
              updateField("role", e.target.value as EmployeeRole)
            }
          >
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="form-buttons">
        <button type="submit" className="btn-register">
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-register">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

export default EmployeeForm;
