import { NotebookPen, Phone, UserRound } from "lucide-react";
import type { ClientForm } from "../../types/client.types";

type UpdateField<T> = <K extends keyof T>(field: K, value: T[K]) => void;

type Props = {
  form: ClientForm;
  updateField: UpdateField<ClientForm>;
};

const EmergencyFields = ({ form, updateField }: Props) => {
  return (
    <>
      <div className="form-group">
        <label>Contacto de emergencia</label>
        <div className="input-with-icon">
          <UserRound size={16} />
          <input
            placeholder="Nombre del contacto"
            value={form.emergencyContact || ""}
            onChange={(e) => updateField("emergencyContact", e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Telefono emergencia</label>
        <div className="input-with-icon">
          <Phone size={16} />
          <input
            placeholder="Numero telefonico"
            value={form.emergencyPhone || ""}
            onChange={(e) => updateField("emergencyPhone", e.target.value)}
          />
        </div>
      </div>

      <div className="form-group full-width">
        <label>Observaciones</label>
        <div className="input-with-icon textarea-field">
          <NotebookPen size={16} />
          <textarea
            placeholder="Observaciones"
            value={form.notes || ""}
            onChange={(e) => updateField("notes", e.target.value)}
          />
        </div>
      </div>
    </>
  );
};

export default EmergencyFields;
