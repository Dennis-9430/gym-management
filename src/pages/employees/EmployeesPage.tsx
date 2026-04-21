/* Pagina de gestion de empleados */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react";
import EmployeeForm from "../../components/employees/EmployeeForm";
import EmployeeSearch from "../../components/employees/EmployeeSearch";
import EmployeeTable from "../../components/employees/EmployeeTable";
import { useEmployees } from "../../hooks/useEmployees";
import type { Employee, EmployeeInput, EmployeeUpdate } from "../../types/employee.types";
import "../../styles/clientsRegister.css";
import "../../styles/employees.css";

const EmployeesPage = () => {
  const navigate = useNavigate();
  const {
    employees,
    totalEmployees,
    search,
    setSearch,
    error,
    addEmployee,
    updateEmployeeById,
    removeEmployee,
  } = useEmployees();
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const openNewForm = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  const openEditForm = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const closeForm = () => {
    setEditingEmployee(null);
    setShowForm(false);
  };

  const handleSubmit = (values: EmployeeInput) => {
    const actionLabel = editingEmployee ? "actualizar" : "registrar";
    if (!confirm(`Deseas ${actionLabel} este empleado?`)) {
      return;
    }
    try {
      if (editingEmployee) {
        const payload: Record<string, unknown> = { ...values };
        if (!payload.password || !(payload.password as string).trim()) {
          delete payload.password;
        }
        updateEmployeeById(editingEmployee.id, payload as EmployeeUpdate);
      } else {
        addEmployee(values);
      }
      closeForm();
    } catch {
      // error handled in hook
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Deseas eliminar este empleado?")) {
      removeEmployee(id);
    }
  };

  return (
    <main className="employees-container">
      <section className="employees-header">
        <div>
          <h2>Empleados</h2>
          <p className="employees-subtitle">
            Gestiona el personal del gimnasio.
          </p>
        </div>
        <div className="employees-actions">
          <EmployeeSearch value={search} onChange={setSearch} />
          <button className="employee-add-btn" onClick={openNewForm}>
            <Plus size={18} />
            Agregar empleado
          </button>
        </div>
      </section>

      <div className="employees-stats">
        Total empleados: {totalEmployees} | Mostrando: {employees.length}
      </div>

      <section className="employees-list">
        <div className="employees-table-wrapper">
          <EmployeeTable
            employees={employees}
            onSelect={(id) => navigate(`/employees/${id}`)}
            onEdit={openEditForm}
            onDelete={handleDelete}
          />
        </div>
      </section>

      {showForm && (
        <div className="employee-modal-backdrop" onClick={closeForm}>
          <div
            className="employee-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="employee-modal-header">
              <div>
                <h3>{editingEmployee ? "Editar empleado" : "Agregar empleado"}</h3>
                <p className="employees-subtitle">
                  Completa los datos para registrar el empleado.
                </p>
              </div>
              <button className="employee-modal-close" onClick={closeForm}>
                <X size={18} />
              </button>
            </div>
            <EmployeeForm
              idValue={editingEmployee?.id ?? null}
              initialValues={editingEmployee ?? undefined}
              onSubmit={handleSubmit}
              onCancel={closeForm}
              submitLabel={editingEmployee ? "Actualizar" : "Guardar"}
              requirePassword={!editingEmployee}
            />
            {error && <p className="form-error">{error}</p>}
          </div>
        </div>
      )}
    </main>
  );
};

export default EmployeesPage;
