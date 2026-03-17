import { useState, useCallback } from "react";

export type ValidationFn = (value: string) => boolean;

export interface FieldConfig {
  name: string;
  rules?: { validate: ValidationFn; message: string }[];
}

export interface UseFormOptions {
  fields: FieldConfig[];
  initialValues: Record<string, string>;
}

export interface UseFormReturn {
  values: Record<string, string>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  handleChange: (name: string, value: string) => void;
  handleBlur: (name: string) => void;
  handleSubmit: (onSubmit: (values: Record<string, string>) => void) => (e?: Event) => void;
  reset: () => void;
  setValues: (values: Record<string, string>) => void;
}

export function useForm(options: UseFormOptions): UseFormReturn {
  const { fields, initialValues } = options;

  const [values, setValuesState] = useState<Record<string, string>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback(
    (name: string, value: string): string | null => {
      const field = fields.find((f) => f.name === name);
      if (!field?.rules) return null;

      for (const rule of field.rules) {
        if (!rule.validate(value)) {
          return rule.message;
        }
      }
      return null;
    },
    [fields]
  );

  const validateAll = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    for (const field of fields) {
      const value = values[field.name] || "";
      const error = validateField(field.name, value);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [fields, values, validateField]);

  const handleChange = useCallback(
    (name: string, value: string) => {
      setValuesState((prev) => ({ ...prev, [name]: value }));
      if (touched[name]) {
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error || "" }));
      }
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (name: string) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      const value = values[name] || "";
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error || "" }));
    },
    [values, validateField]
  );

  const handleSubmit = useCallback(
    (onSubmit: (values: Record<string, string>) => void) => {
      return (e?: Event) => {
        if (e) {
          e.preventDefault();
        }
        const allTouched: Record<string, boolean> = {};
        fields.forEach((f) => {
          allTouched[f.name] = true;
        });
        setTouched(allTouched);

        if (validateAll()) {
          onSubmit(values);
        }
      };
    },
    [fields, validateAll, values]
  );

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const setValues = useCallback((newValues: Record<string, string>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  const isValid = Object.keys(errors).length === 0 && Object.values(errors).every(e => !e);

  return {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
  };
}

export const validationRules = {
  required: (message = "Este campo es requerido"): { validate: ValidationFn; message: string } => ({
    validate: (value) => value !== null && value !== undefined && value.trim() !== "",
    message,
  }),

  email: (message = "Email inválido"): { validate: ValidationFn; message: string } => ({
    validate: (value) => {
      if (!value) return true;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message,
  }),

  minLength: (min: number, message?: string): { validate: ValidationFn; message: string } => ({
    validate: (value) => {
      if (!value) return true;
      return value.length >= min;
    },
    message: message || `Mínimo ${min} caracteres`,
  }),

  maxLength: (max: number, message?: string): { validate: ValidationFn; message: string } => ({
    validate: (value) => {
      if (!value) return true;
      return value.length <= max;
    },
    message: message || `Máximo ${max} caracteres`,
  }),

  numeric: (message = "Debe ser numérico"): { validate: ValidationFn; message: string } => ({
    validate: (value) => {
      if (!value) return true;
      return !isNaN(Number(value));
    },
    message,
  }),

  positive: (message = "Debe ser positivo"): { validate: ValidationFn; message: string } => ({
    validate: (value) => {
      if (!value) return true;
      return Number(value) > 0;
    },
    message,
  }),

  pattern: (regex: RegExp, message = "Formato inválido"): { validate: ValidationFn; message: string } => ({
    validate: (value) => {
      if (!value) return true;
      return regex.test(value);
    },
    message,
  }),
};
