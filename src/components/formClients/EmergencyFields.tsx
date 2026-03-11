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
        <label>Contacto de Emergencia</label>
        <input
          placeholder="Nombre del contacto"
          value={form.emergencyContact || ""}
          onChange={(e) => updateField("emergencyContact", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Teléfono Emergencia</label>
        <input
          placeholder="Número teléfonico"
          value={form.emergencyPhone || ""}
          onChange={(e) => updateField("emergencyPhone", e.target.value)}
        />
      </div>

      <div className="form-group full-width">
        <label>Observaciones</label>
        <textarea
          placeholder="Observaciones"
          value={form.notes || ""}
          onChange={(e) => updateField("notes", e.target.value)}
        />
      </div>
    </>
  );
};

export default EmergencyFields;
