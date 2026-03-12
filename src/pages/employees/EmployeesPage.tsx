import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeForm from "../../components/employees/EmployeeForm";
import EmployeeTable from "../../components/employees/EmployeeTable";
import { useEmployees } from "../../hooks/useEmployees";
import type { Employee, EmployeeInput } from "../../types/employee.types";
import "../../styles/clientsRegister.css";
import "../../styles/employees.css";

const EmployeesPage = () => {
  const { employees, error, addEmployee, updateEmployeeById, removeEmployee } =
    useEmployees();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"add" | "list">("add");
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const handleSubmit = (values: EmployeeInput) => {
    try {
      if (editingEmployee) {
        const payload = { ...values };
        if (!payload.password.trim()) {
          delete payload.password;
        }
        updateEmployeeById(editingEmployee.id, payload);
        setEditingEmployee(null);
      } else {
        addEmployee(values);
      }
      setActiveTab("list");
    } catch {
      // error handled in hook
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee({ ...employee, password: "" });
    setActiveTab("add");
  };

  const handleDelete = (id: number) => {
    if (confirm("Deseas eliminar este empleado?")) {
      removeEmployee(id);
    }
  };

  const handleCancelEdit = () => {
    setEditingEmployee(null);
  };

  return (
    <main className="employees-container">
      <div className="tabs">
        <button
          className={activeTab === "add" ? "active-tab" : ""}
          onClick={() => setActiveTab("add")}
        >
          Agregar
        </button>
        <button
          className={activeTab === "list" ? "active-tab" : ""}
          onClick={() => setActiveTab("list")}
        >
          Lista
        </button>
      </div>

      {activeTab === "add" && (
        <div className="register-container">
          <div className="register-card">
            <h2>{editingEmployee ? "Editar empleado" : "Registrar empleado"}</h2>
            <EmployeeForm
              initialValues={editingEmployee ?? undefined}
              onSubmit={handleSubmit}
              onCancel={editingEmployee ? handleCancelEdit : undefined}
              submitLabel={editingEmployee ? "Actualizar" : "Registrar"}
              requirePassword={!editingEmployee}
            />
            {error && <p className="form-error">{error}</p>}
          </div>
        </div>
      )}

      {activeTab === "list" && (
        <section className="clients-container">
          <h2>Lista de empleados</h2>
          <div className="employees-table-wrapper">
            <EmployeeTable
              employees={employees}
              onSelect={(id) => navigate(`/employees/${id}`)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </section>
      )}
    </main>
  );
};

export default EmployeesPage;
