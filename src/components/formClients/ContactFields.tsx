import type { Person } from "../../types/person.types";
type Props = {
  form: Person;
  updateField: (field: keyof Person, value: any) => void;
};

const ContactFields = ({ form, updateField }: Props) => {
  return (
    <>
      <div className="form-group full-width">
        <label>Dirección Domiciliaria</label>
        <input
          placeholder="Dirección del domicilio"
          value={form.address || ""}
          onChange={(e) => updateField("address", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          placeholder="correo@email.com"
          value={form.email || ""}
          onChange={(e) => updateField("email", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Télefono</label>
        <input
          placeholder="Teléfono"
          value={form.phone || ""}
          onChange={(e) => updateField("phone", e.target.value)}
        />
      </div>
    </>
  );
};

export default ContactFields;
