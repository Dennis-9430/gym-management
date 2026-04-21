import { useState, useEffect } from "react";
import { X, Plus, Pencil, Trash2, Save } from "lucide-react";
import type { Service } from "../../types/payment.types";

/* Datos del formulario de membresía */
interface MembershipFormData {
  id?: number;
  name: string;
  price: number;
  days: number;
  description: string;
  isActive: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  onSave: (service: Service) => void;
  onDelete: (id: number) => void;
}

const MembershipModal = ({ isOpen, onClose, services, onSave, onDelete }: Props) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<MembershipFormData>({
    name: "",
    price: 0,
    days: 30,
    description: "",
    isActive: true,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: "", price: 0, days: 30, description: "", isActive: true });
      setError("");
    }
  }, [isOpen]);

  const handleEdit = (service: Service) => {
    const days = getDaysFromService(service);
    setFormData({
      id: service.id,
      name: service.name,
      price: service.price,
      days,
      description: "",
      isActive: true,
    });
    setEditingId(service.id);
    setShowForm(true);
  };

  const getDaysFromService = (service: Service): number => {
    if (service.name.toLowerCase().includes("diario")) return 1;
    if (service.name.toLowerCase().includes("quincenal")) return 15;
    if (service.name.toLowerCase().includes("semanal")) return 7;
    if (service.name.toLowerCase().includes("mensual")) return 30;
    return 30;
  };

  const handleNew = () => {
    setFormData({ name: "", price: 0, days: 30, description: "", isActive: true });
    setEditingId(null);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    if (formData.price <= 0) {
      setError("El precio debe ser mayor a 0");
      return;
    }

    if (formData.days <= 0) {
      setError("La duración debe ser mayor a 0");
      return;
    }

    const service: Service = {
      id: editingId || Date.now(),
      name: formData.name.trim(),
      price: Number(formData.price),
    };

    onSave(service);
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de eliminar esta membresía?")) {
      onDelete(id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", price: 0, days: 30, description: "", isActive: true });
  };

  if (!isOpen) return null;

  return (
    <div className="membership-modal-backdrop" onClick={onClose}>
      <div className="membership-modal" onClick={(e) => e.stopPropagation()}>
        <div className="membership-modal__header">
          <div>
            <h3>Membresías</h3>
            <p>Configura los planes de membresía disponibles</p>
          </div>
          <button className="membership-modal__close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {!showForm ? (
          <>
            <div className="membership-modal__actions">
              <button className="membership-modal__add" onClick={handleNew}>
                <Plus size={18} />
                Nueva Membresía
              </button>
            </div>

            <div className="membership-modal__table-wrapper">
              <table className="membership-modal__table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Duración</th>
                    <th>Precio</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.id}>
                      <td>{service.name}</td>
                      <td>{getDaysFromService(service)} días</td>
                      <td>${service.price.toFixed(2)}</td>
                      <td className="membership-modal__actions-cell">
                        <button
                          className="membership-modal__btn-edit"
                          onClick={() => handleEdit(service)}
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="membership-modal__btn-delete"
                          onClick={() => handleDelete(service.id)}
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <form className="membership-modal__form" onSubmit={handleSubmit}>
            <div className="membership-form__group">
              <label>Nombre</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Mensual, Quincenal"
              />
            </div>

            <div className="membership-form__row">
              <div className="membership-form__group">
                <label>Duración (días)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.days}
                  onChange={(e) => setFormData({ ...formData, days: Number(e.target.value) })}
                />
              </div>

              <div className="membership-form__group">
                <label>Precio ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />
              </div>
            </div>

            {error && <p className="membership-form__error">{error}</p>}

            <div className="membership-form__actions">
              <button type="submit" className="membership-form__save">
                <Save size={16} />
                {editingId ? "Actualizar" : "Guardar"}
              </button>
              <button
                type="button"
                className="membership-form__cancel"
                onClick={handleCancel}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default MembershipModal;
