import { useState } from "react";
import type { User } from "../types/user.types";

type UpdateField<T> = <K extends keyof T>(field: K, value: T[K]) => void;

export const initialState: User = {
  id: 0,
  username: "",
  password: "",

  firstName: "",
  lastName: "",

  phone: "",
  email: "",
  address: "",

  documentNumber: "",

  role: "EMPLOYEE",

  createdAt: new Date(),
};

const useEmployeeForm = () => {
  const [form, setForm] = useState<User>(initialState);

  const updateField: UpdateField<User> = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialState);
  };

  return {
    form,
    updateField,
    resetForm,
  };
};

export default useEmployeeForm;
