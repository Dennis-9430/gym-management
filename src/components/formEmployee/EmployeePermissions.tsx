import type { User } from "../../types/user.types";

type UpdateField<T> = <K extends keyof T>(field: K, value: T[K]) => void;

type Props = {
  form: User;
  updateField: UpdateField<User>;
};

const EmployeePermissions = ({ form, updateField }: Props) => {
  return (
    <>
      <div className="form-group">
        <label>Usuario</label>
        <input
          value={form.username}
          onChange={(e) => updateField("username", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Contraseña</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Rol</label>
        <select
          value={form.role}
          onChange={(e) => updateField("role", e.target.value)}
        >
          <option value="ADMIN">Administrador</option>
          <option value="EMPLOYEE">Empleado</option>
        </select>
      </div>
    </>
  );
};

export default EmployeePermissions;
