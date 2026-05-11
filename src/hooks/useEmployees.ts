/* Hook de empleados sin fallback local para no inventar estado de negocio */
import { useMemo, useState, useCallback } from "react";
import type { Employee, EmployeeInput, EmployeeUpdate } from "../types/employee.types";
import {
  getEmployees,
  createEmployeeAPI,
  updateEmployeeAPI,
  deleteEmployeeAPI,
} from "../services/employees.service";

const sortEmployees = (a: Employee, b: Employee): number => {
  if (a.isOwner) return -1;
  if (b.isOwner) return 1;
  return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
};

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar empleados";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    const base = query
      ? employees.filter((emp) =>
          `${emp.firstName} ${emp.lastName} ${emp.email} ${emp.username} ${emp.role}`
            .toLowerCase()
            .includes(query),
        )
      : employees;

    return [...base].sort(sortEmployees);
  }, [employees, search]);

  const addEmployee = async (input: EmployeeInput) => {
    setError(null);
    try {
      const created = await createEmployeeAPI(input);
      setEmployees((prev) => [...prev, created].sort(sortEmployees));
      return created;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      setError(message);
      throw err;
    }
  };

  const updateEmployeeById = async (id: string, update: EmployeeUpdate) => {
    setError(null);
    try {
      const updated = await updateEmployeeAPI(id, update);
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === id ? updated : emp)).sort(sortEmployees),
      );
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      setError(message);
      throw err;
    }
  };

  const removeEmployee = async (id: string) => {
    setError(null);
    try {
      await deleteEmployeeAPI(id);
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      setError(message);
      throw err;
    }
  };

  const getById = (id: string) => employees.find((emp) => emp.id === id) ?? null;
  const realEmployees = employees.filter((emp) => !emp.isOwner);

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
