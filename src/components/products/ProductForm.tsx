import { useState, useMemo } from "react";
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
      setError("El codigo del producto es obligatorio");
      return;
    }

    if (!form.name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    if (!form.description.trim()) {
      setError("La descripcion es obligatoria");
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
    <form className="product-modal-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Codigo del producto</label>
        <input
          value={form.code}
          onChange={(e) => updateField("code", e.target.value)}
          placeholder="Codigo SKU o barras"
        />
      </div>

      <div className="form-group">
        <label>Nombre</label>
        <input
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="Nombre"
        />
      </div>

      <div className="form-group full-width">
        <label>Descripcion</label>
        <textarea
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Descripcion"
        />
      </div>

      <div className="form-group">
        <label>Categoria</label>
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

      <div className="form-group">
        <label>Precio unitario</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.unitPrice}
          onChange={(e) => updateField("unitPrice", Number(e.target.value))}
        />
      </div>

      <div className="form-group">
        <label>Cantidad</label>
        <input
          type="number"
          min="0"
          step="1"
          value={form.quantity}
          onChange={(e) => updateField("quantity", Number(e.target.value))}
        />
      </div>

      <div className="form-group">
        <label>Stock minimo</label>
        <input
          type="number"
          min="0"
          step="1"
          value={form.minStock}
          onChange={(e) => updateField("minStock", Number(e.target.value))}
        />
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="form-buttons">
        <button type="submit" className="btn-register">
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-register cancel">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

export default ProductForm;