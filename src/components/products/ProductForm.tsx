import { useState, useMemo } from "react";
import { Package, FileText, Tag, DollarSign, Layers, AlertTriangle } from "lucide-react";
import type { ProductInput } from "../../types/product.types";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS,
} from "../../types/product.types";

/* Formulario para crear o editar productos */
interface Props {
  idValue?: number | null;
  initialValues?: ProductInput;
  onSubmit: (values: ProductInput) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

const defaultValues: ProductInput = {
  code: "",
  name: "",
  description: "",
  category: "SUPLEMENTOS",
  unitPrice: 0,
  quantity: 0,
  minStock: 5,
};

const ProductForm = ({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Guardar",
}: Props) => {
  const initialForm = useMemo(
    () => (initialValues ? { ...defaultValues, ...initialValues } : defaultValues),
    [initialValues],
  );
  const [form, setForm] = useState<ProductInput>(initialForm);
  const [error, setError] = useState<string | null>(null);

  const updateField = <K extends keyof ProductInput>(
    field: K,
    value: ProductInput[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!form.code.trim()) {
      setError("El código del producto es obligatorio");
      return;
    }

    if (!form.name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    if (!form.description.trim()) {
      setError("La descripción es obligatoria");
      return;
    }

    if (form.unitPrice <= 0) {
      setError("El precio unitario debe ser mayor a 0");
      return;
    }

    if (form.quantity < 0) {
      setError("La cantidad no puede ser negativa");
      return;
    }

    onSubmit({
      ...form,
      code: form.code.trim(),
      name: form.name.trim(),
      description: form.description.trim(),
    });
  };

  return (
    <form className="register-form product-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Código del producto</label>
        <div className="input-with-icon">
          <Tag size={16} />
          <input
            value={form.code}
            onChange={(e) => updateField("code", e.target.value)}
            placeholder="Código SKU o barras"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Nombre</label>
        <div className="input-with-icon">
          <Package size={16} />
          <input
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Nombre"
          />
        </div>
      </div>

      <div className="form-group full-width">
        <label>Descripción</label>
        <div className="input-with-icon textarea-field">
          <FileText size={16} />
          <textarea
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Descripción"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Categoría</label>
        <div className="input-with-icon">
          <Tag size={16} />
          <select
            value={form.category}
            onChange={(e) =>
              updateField(
                "category",
                e.target.value as ProductInput["category"],
              )
            }
          >
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {PRODUCT_CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Precio unitario</label>
        <div className="input-with-icon">
          <DollarSign size={16} />
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.unitPrice}
            onChange={(e) => updateField("unitPrice", Number(e.target.value))}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Cantidad</label>
        <div className="input-with-icon">
          <Layers size={16} />
          <input
            type="number"
            min="0"
            step="1"
            value={form.quantity}
            onChange={(e) => updateField("quantity", Number(e.target.value))}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Stock mínimo</label>
        <div className="input-with-icon">
          <AlertTriangle size={16} />
          <input
            type="number"
            min="0"
            step="1"
            value={form.minStock}
            onChange={(e) => updateField("minStock", Number(e.target.value))}
          />
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="form-buttons">
        <button type="submit" className="btn-register">
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-register">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

export default ProductForm;
