import type { Person } from "../../types/person.types";
import type { DocumentType } from "../../types/client.types";

type UpdateField<T> = <K extends keyof T>(field: K, value: T[K]) => void;

type Props<T extends Person> = {
  form: T;
  updateField: UpdateField<T>;
};

function PersonalDataFields<T extends Person>({ form, updateField }: Props<T>) {
  return (
    <>
      <div className="form-group">
        <label>Tipo de documento</label>
        <select
          value={(form as any).documentType || "CEDULA"}
          onChange={(e) => updateField("documentType" as keyof T, e.target.value as DocumentType)}
        >
          <option value="CEDULA">Cédula</option>
          <option value="PASAPORTE">Pasaporte</option>
          <option value="RUC">RUC</option>
        </select>
      </div>

      <div className="form-group">
        <label>Numero de documento</label>
        <input
          placeholder="Numero de documento"
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
    </>
  );
}

export default PersonalDataFields;