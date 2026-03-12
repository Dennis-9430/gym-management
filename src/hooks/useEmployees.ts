import { useEffect, useState } from "react";
import type { Employee, EmployeeInput, EmployeeUpdate } from "../types/employee.types";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../services/employees.service";

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    setEmployees(getEmployees());
  };

  useEffect(() => {
    refresh();
  }, []);

  const addEmployee = (input: EmployeeInput) => {
    setError(null);
    try {
      const created = createEmployee(input);
      setEmployees((prev) => [...prev, created].sort((a, b) => a.id - b.id));
      return created;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      setError(message);
      throw err;
    }
  };

  const updateEmployeeById = (id: number, update: EmployeeUpdate) => {
    setError(null);
    try {
      const updated = updateEmployee(id, update);
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === id ? updated : emp)),
      );
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      setError(message);
      throw err;
    }
  };

  const removeEmployee = (id: number) => {
    deleteEmployee(id);
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
  };

  const getById = (id: number) => employees.find((emp) => emp.id === id) ?? null;

  return {
    employees,
    error,
    refresh,
    addEmployee,
    updateEmployeeById,
    removeEmployee,
    getById,
  };
};
