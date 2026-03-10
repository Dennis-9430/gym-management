import { useState } from "react";
import type { User } from "../types/user.types";

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

  const updateField = (field: keyof User, value: any) => {
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
