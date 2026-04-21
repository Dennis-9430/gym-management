import { IdCard, User, UserRound } from "lucide-react";
import type { Person } from "../../types/person.types";

/* Campos de datos personales en formulario */
type UpdateField<T> = <K extends keyof T>(field: K, value: T[K]) => void;

type Props<T extends Person> = {
  form: T;
  updateField: UpdateField<T>;
};

function PersonalDataFields<T extends Person>({
  form,
  updateField,
}: Props<T>) {
  return (
    <>
      <div className="form-group full-width">
        <label>Numero de cedula</label>
        <div className="input-with-icon">
          <IdCard size={16} />
          <input
            placeholder="Numero de cedula"
            value={form.documentNumber}
            onChange={(e) => updateField("documentNumber", e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Nombres</label>
        <div className="input-with-icon">
          <User size={16} />
          <input
            placeholder="Nombres"
            value={form.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Apellidos</label>
        <div className="input-with-icon">
          <UserRound size={16} />
          <input
            placeholder="Apellidos"
            value={form.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
          />
        </div>
      </div>
    </>
  );
}

export default PersonalDataFields;
