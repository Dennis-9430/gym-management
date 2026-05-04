/* Hook para gestionar empleados con MongoDB */
import { useMemo, useState, useCallback } from "react";
import type { Employee, EmployeeInput, EmployeeUpdate } from "../types/employee.types";
import {
  getEmployees,
  createEmployee,
  createEmployeeAPI,
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
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    let filtered = employees;
    if (query) {
      filtered = employees.filter((emp) =>
        `${emp.firstName} ${emp.lastName} ${emp.email} ${emp.username} ${emp.role}`
          .toLowerCase()
          .includes(query),
      );
    }
    return filtered.sort((a, b) => {
      if (a.isOwner) return -1;
      if (b.isOwner) return 1;
      if (typeof a.id === 'number' && typeof b.id === 'number') {
        return a.id - b.id;
      }
      return String(a.id).localeCompare(String(b.id));
    });
  }, [employees, search]);

const sortEmployees = (a: Employee, b: Employee): number => {
      if (a.isOwner) return -1;
      if (b.isOwner) return 1;
      if (typeof a.id === 'number' && typeof b.id === 'number') {
        return a.id - b.id;
      }
      return String(a.id).localeCompare(String(b.id));
    };
    
    const addEmployee = async (input: EmployeeInput) => {
      setError(null);
      try {
        // Intentar API primero
        const created = await createEmployeeAPI(input);
        if (created) {
          setEmployees((prev) => [...prev, created].sort(sortEmployees));
          return created;
        }
        // Fallback local
        const createdLocal = createEmployee(input);
        setEmployees((prev) => [...prev, createdLocal].sort(sortEmployees));
        return createdLocal;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      setError(message);
      throw err;
    }
  };

  const updateEmployeeById = async (id: number | string, update: EmployeeUpdate) => {
    const idNum = typeof id === 'string' ? parseInt(id, 10) : id;
    if (!id || (!Number.isNaN(idNum) && idNum <= 0)) {
      setError("ID de empleado inválido");
      throw new Error("ID de empleado inválido: " + id);
    }
    
    setError(null);
    try {
      const updated = await updateEmployeeAPI(id, update);
      if (updated) {
        setEmployees((prev) =>
          prev.map((emp) => (emp.id === id || emp.id === idNum ? updated : emp)),
        );
        return updated;
      }
      throw new Error("No se pudo actualizar el empleado");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      setError(message);
      throw err;
    }
  };

  const removeEmployee = async (id: number | string) => {
    setError(null);
    try {
      // Para ObjectId strings, pasar directo; para números hacer parse
      const apiId = typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id) ? id : 
                    typeof id === 'string' ? parseInt(id, 10) : id;
      
      const deleted = await deleteEmployeeAPI(apiId);
      if (deleted) {
        setEmployees((prev) => prev.filter((emp) => emp.id !== id));
        return;
      }
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
