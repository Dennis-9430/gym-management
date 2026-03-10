import type { Person } from "../../types/person.types";

type Props = {
  form: Person;
  updateField: (field: keyof Person, value: any) => void;
};

const PersonalDataFields = ({ form, updateField }: Props) => {
  return (
    <>
      <div className="form-group full-width">
        <label>Número de Cédula</label>
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
    </>
  );
};

export default PersonalDataFields;
