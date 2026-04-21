import { Mail, MapPin, Phone } from "lucide-react";
import type { Person } from "../../types/person.types";

/* Campos de contacto en formulario */
type UpdateField<T> = <K extends keyof T>(field: K, value: T[K]) => void;

type Props<T extends Person> = {
  form: T;
  updateField: UpdateField<T>;
};

function ContactFields<T extends Person>({ form, updateField }: Props<T>) {
  return (
    <>
      <div className="form-group full-width">
        <label>Direccion domiciliaria</label>
        <div className="input-with-icon">
          <MapPin size={16} />
          <input
            placeholder="Direccion del domicilio"
            value={form.address || ""}
            onChange={(e) => updateField("address", e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Email</label>
        <div className="input-with-icon">
          <Mail size={16} />
          <input
            type="email"
            placeholder="correo@email.com"
            value={form.email || ""}
            onChange={(e) => updateField("email", e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Telefono</label>
        <div className="input-with-icon">
          <Phone size={16} />
          <input
            placeholder="Telefono"
            value={form.phone || ""}
            onChange={(e) => updateField("phone", e.target.value)}
          />
        </div>
      </div>
    </>
  );
}

export default ContactFields;
