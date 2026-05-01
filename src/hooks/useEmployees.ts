/* Hook para gestionar empleados con MongoDB */
import { useMemo, useState, useCallback } from "react";
import type { Employee, EmployeeInput, EmployeeUpdate } from "../types/employee.types";
import {
  getEmployees,
  createEmployee,
  createEmployeeAPI,
  updateEmployee,
  updateEmployeeAPI,
  deleteEmployee,
  deleteEmployeeAPI,
} from "../services/employees.service";

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Carga empleados desde API
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error("Error cargando empleados:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return employees;
    return employees.filter((emp) =>
      `${emp.firstName} ${emp.lastName} ${emp.email} ${emp.username} ${emp.role}`
        .toLowerCase()
        .includes(query),
    );
  }, [employees, search]);

  const addEmployee = async (input: EmployeeInput) => {
    setError(null);
    try {
      // Intentar API primero
      const created = await createEmployeeAPI(input);
      if (created) {
        setEmployees((prev) => [...prev, created].sort((a, b) => a.id - b.id));
        return created;
      }
      // Fallback local
      const createdLocal = createEmployee(input);
      setEmployees((prev) => [...prev, createdLocal].sort((a, b) => a.id - b.id));
      return createdLocal;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      setError(message);
      throw err;
    }
  };

  const updateEmployeeById = async (id: number, update: EmployeeUpdate) => {
    setError(null);
    try {
      // Intentar API primero
      const updated = await updateEmployeeAPI(id, update);
      if (updated) {
        setEmployees((prev) =>
          prev.map((emp) => (emp.id === id ? updated : emp)),
        );
        return updated;
      }
      // Fallback local
      const updatedLocal = updateEmployee(id, update);
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === id ? updatedLocal : emp)),
      );
      return updatedLocal;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      setError(message);
      throw err;
    }
  };

  const removeEmployee = async (id: number) => {
    setError(null);
    try {
      // Intentar API primero
      const deleted = await deleteEmployeeAPI(id);
      if (deleted) {
        setEmployees((prev) => prev.filter((emp) => emp.id !== id));
        return;
      }
      // Fallback local
      deleteEmployee(id);
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      setError(message);
      throw err;
    }
  };

const getById = (id: number) => employees.find((emp) => emp.id === id) ?? null;
  const realEmployees = employees.filter(emp => !emp.isOwner);
  
  return {
    employees: filteredEmployees,
    realEmployees,
    totalEmployees: employees.length,
    search,
    setSearch,
    error,
    loading,
    refresh,
    addEmployee,
    updateEmployeeById,
    removeEmployee,
    getById,
  };
};
