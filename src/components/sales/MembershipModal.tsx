import { useState, useEffect } from "react";
import { X, Plus, Pencil, Trash2, Save } from "lucide-react";
import type {
  Service,
  DurationUnit,
  ServiceType,
} from "../../types/payment.types";
import {
  createService,
  updateService,
  deleteService,
} from "../../services/services.service";

const getTenantId = (): string => {
  // Leer tenantId desde localStorage("tenant") que se persiste al hacer login
  // ⚠️ VISUAL CACHE ONLY: no es fuente de verdad de seguridad
  try {
    const tenant = localStorage.getItem("tenant");
    if (tenant) {
      return JSON.parse(tenant).tenantId || "";
    }
  } catch {
    // fallback
  }
  return "";
};

/* Datos del formulario de membresía */
interface MembershipFormData {
  id?: string | number;
  name: string;
  price: string; // String para manejar decimales durante escritura
  taxRate: string; // String para manejar decimales (% IVA)
  days: number;
  description: string;
  isActive: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  onRefresh: () => void;
}

const MembershipModal = ({ isOpen, onClose, services, onRefresh }: Props) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState<MembershipFormData>({
    name: "",
    price: "",
    taxRate: "",
    days: 30,
    description: "",
    isActive: true,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: "",
      price: "",
      taxRate: "",
      days: 30,
      description: "",
      isActive: true,
    });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleEdit = (service: Service) => {
    const days = service.duration || getDaysFromService(service);
    setFormData({
      id: service.id,
      name: service.name,
      price: String(service.price),
      taxRate: service.taxRate ? String(service.taxRate) : "",
      days,
      description: service.description || "",
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
    setFormData({
      name: "",
      price: "",
      taxRate: "",
      days: 30,
      description: "",
      isActive: true,
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    const numericPrice = parseFloat(formData.price);
    if (!formData.price || isNaN(numericPrice) || numericPrice <= 0) {
      setError("El precio debe ser mayor a 0");
      return;
    }

    if (formData.days <= 0) {
      setError("La duración debe ser mayor a 0");
      return;
    }

    const numericTaxRate = formData.taxRate ? parseFloat(formData.taxRate) : 0;

    setSaving(true);
    try {
      const serviceData = {
        tenantId: getTenantId(),
        name: formData.name.trim(),
        description: formData.description,
        price: numericPrice,
        taxRate: numericTaxRate,
        duration: formData.days,
        durationUnit: "days" as DurationUnit,
        type: "membership" as ServiceType,
        isActive: true,
      };

      if (editingId) {
        await updateService(editingId as string, serviceData);
      } else {
        await createService(serviceData);
      }

      onRefresh();
      setShowForm(false);
      setEditingId(null);
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.message || "Error al guardar. Intenta de nuevo.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("¿Estás seguro de eliminar esta membresía?")) {
      return;
    }
    try {
      await deleteService(id as string);
      onRefresh();
    } catch (err) {
      alert("Error al eliminar la membresía.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="membership-modal-backdrop">
      <div className="membership-modal">
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
                    <th>Subtotal</th>
                    <th>IVA (%)</th>
                    <th>IVA ($)</th>
                    <th>Total (PVP)</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.id}>
                      <td data-label="Nombre">{service.name}</td>
                      <td data-label="Duración">
                        {service.duration || getDaysFromService(service)} días
                      </td>
                      <td data-label="Subtotal">
                        ${(() => {
                          const pvp = Number(service.price);
                          const tr = service.taxRate || 0;
                          if (tr <= 0) return pvp.toFixed(2);
                          const subtotal = pvp / (1 + tr / 100);
                          return subtotal.toFixed(2);
                        })()}
                      </td>
                      <td data-label="IVA (%)">{service.taxRate || 0}%</td>
                      <td data-label="IVA ($)">
                        ${(() => {
                          const pvp = Number(service.price);
                          const tr = service.taxRate || 0;
                          if (tr <= 0) return "0.00";
                          const subtotal = pvp / (1 + tr / 100);
                          return (subtotal * tr / 100).toFixed(2);
                        })()}
                      </td>
                      <td data-label="Total (PVP)"><strong>${Number(service.price).toFixed(2)}</strong></td>
                      <td data-label="Acciones" className="membership-modal__actions-cell">
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
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ej: Mensual, Quincenal"
              />
            </div>

            <div className="membership-form__row">
              <div className="membership-form__group">
                <label>Duración (días)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.days || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setFormData({
                      ...formData,
                      days: val ? parseInt(val, 10) : 0,
                    });
                  }}
                />
              </div>

              <div className="membership-form__group">
                <label>Precio Total (PVP $)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={formData.price}
                  onChange={(e) => {
                    let val = e.target.value;

                    // Permitir solo números y punto/coma
                    val = val.replace(/[^0-9.,]/g, "");

                    // Convertir coma a punto
                    val = val.replace(",", ".");

                    // Solo un punto decimal
                    const dotIndex = val.indexOf(".");
                    if (dotIndex !== -1) {
                      val =
                        val.substring(0, dotIndex + 1) +
                        val.substring(dotIndex + 1).replace(/[.,]/g, "");
                    }

                    // Máximo 2 decimales
                    if (dotIndex !== -1) {
                      const intPart = val.substring(0, dotIndex);
                      const decPart = val.substring(dotIndex + 1, dotIndex + 3);
                      val = `${intPart}.${decPart}`;
                    }

                    setFormData({ ...formData, price: val });
                  }}
                  onBlur={() => {
                    if (formData.price) {
                      const num = parseFloat(formData.price);
                      setFormData({
                        ...formData,
                        price: isNaN(num) ? "" : num.toFixed(2),
                      });
                    }
                  }}
                />
              </div>

              <div className="membership-form__group">
                <label>IVA (%)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={formData.taxRate}
                  onChange={(e) => {
                    let val = e.target.value.replace(/[^0-9.,]/g, "");
                    val = val.replace(",", ".");
                    const dotIndex = val.indexOf(".");
                    if (dotIndex !== -1) {
                      val = val.substring(0, dotIndex + 1) + val.substring(dotIndex + 1).replace(/[.,]/g, "");
                    }
                    if (dotIndex !== -1) {
                      val = val.substring(0, dotIndex + 3);
                    }
                    setFormData({ ...formData, taxRate: val });
                  }}
                  placeholder="15"
                />
              </div>
            </div>

            {/* Preview de totales con IVA incluido */}
            {formData.price && parseFloat(formData.price) > 0 && (
              <div className="membership-form__preview">
                {(() => {
                  const pvp = parseFloat(formData.price) || 0;
                  const tr = parseFloat(formData.taxRate) || 0;
                  if (tr <= 0) {
                    return (
                      <div className="membership-form__preview-row">
                        <span>Total (PVP):</span>
                        <strong>${pvp.toFixed(2)}</strong>
                      </div>
                    );
                  }
                  const subtotal = pvp / (1 + tr / 100);
                  const ivaAmount = subtotal * tr / 100;
                  return (
                    <>
                      <div className="membership-form__preview-row">
                        <span>Subtotal (Base {tr}%):</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="membership-form__preview-row">
                        <span>IVA ({tr}%):</span>
                        <span>${ivaAmount.toFixed(2)}</span>
                      </div>
                      <div className="membership-form__preview-row membership-form__preview-total">
                        <span>Total (PVP):</span>
                        <strong>${pvp.toFixed(2)}</strong>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {error && <p className="membership-form__error">{error}</p>}

            <div className="membership-form__actions">
              <button
                type="submit"
                className="membership-form__save"
                disabled={saving}
              >
                <Save size={16} />
                {saving ? "Guardando..." : editingId ? "Actualizar" : "Guardar"}
              </button>
              <button
                type="button"
                className="membership-form__cancel"
                onClick={onClose}
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
