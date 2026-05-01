/* Pagina de gestion de empleados */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, Lock } from "lucide-react";
import EmployeeForm from "../../components/employees/EmployeeForm";
import EmployeeSearch from "../../components/employees/EmployeeSearch";
import EmployeeTable from "../../components/employees/EmployeeTable";
import PasswordConfirmModal from "../../components/employees/PasswordConfirmModal";
import { useEmployees } from "../../hooks/useEmployees";
import { usePlanAccess } from "../../hooks/usePlanAccess";
import type { Employee, EmployeeInput, EmployeeUpdate } from "../../types/employee.types";
import "../../styles/employees.css";

const EmployeesPage = () => {
  const navigate = useNavigate();
  const { isPremium } = usePlanAccess();
  const {
    employees,
    realEmployees,
    search,
    setSearch,
    error,
    refresh,
    addEmployee,
    updateEmployeeById,
    removeEmployee,
  } = useEmployees();
  
const realCount = realEmployees.length;
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingEmployeeData, setPendingEmployeeData] = useState<EmployeeInput | null>(null);

  // Cargar empleados al montar
  useEffect(() => {
    refresh();
  }, [refresh]);

  const canAddEmployee = () => {
    // BASIC: solo owner, no empleados adicionales
    // PREMIUM: owner + 2 empleados máximo
    if (!isPremium()) {
      alert("En el plan BASIC solo tienes el Owner. ¡Upgrade a PREMIUM para agregar empleados!");
      return false;
    }
    if (realCount >= 2) {
      alert("Has alcanzado el límite máximo de 2 empleados en PREMIUM.");
      return false;
    }
    return true;
  };

  const openNewForm = () => {
    if (!canAddEmployee()) return;
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

  const hasSensitiveChange = (values: EmployeeInput, original?: Employee): boolean => {
    if (!original) return true;
    const usernameChanged = original.username !== values.username;
    const passwordChanged = !!(values.password && values.password.trim());
    return usernameChanged || passwordChanged;
  };

  const handleSubmit = (values: EmployeeInput) => {
    if (!editingEmployee) {
      if (!isPremium()) {
        alert("En el plan BASIC solo tienes el Owner. ¡Upgrade a PREMIUM para agregar empleados!");
        return;
      }
      if (realCount >= 2) {
        alert("Has alcanzado el límite máximo de 2 empleados en PREMIUM.");
        return;
      }
    }

    const needsConfirmation = hasSensitiveChange(values, editingEmployee ?? undefined);
    if (needsConfirmation) {
      setPendingEmployeeData(values);
      setShowPasswordModal(true);
      return;
    }

    executeSubmit(values);
  };

  const executeSubmit = (values: EmployeeInput) => {
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

  const handlePasswordConfirm = async (password: string) => {
    if (!pendingEmployeeData) return;
    
    try {
      const response = await fetch("/api/auth/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      
      if (!response.ok) {
        throw new Error("Invalid password");
      }
      
      setShowPasswordModal(false);
      executeSubmit(pendingEmployeeData);
    } catch {
      alert("Contraseña incorrecta. Intenta de nuevo.");
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
          {realCount >= 1 && !isPremium() ? (
            <div className="pro-feature-locked" style={{ cursor: "not-allowed" }}>
              <Lock size={16} />
              <p>Agregar empleado</p>
              <span className="pro-badge">BASIC</span>
            </div>
          ) : realCount >= 2 && isPremium() ? (
            <div className="pro-feature-locked" style={{ cursor: "not-allowed" }}>
              <Lock size={16} />
              <p>Límite alcanzado</p>
              <span className="pro-badge">PRO</span>
            </div>
          ) : (
            <button className="employee-add-btn" onClick={openNewForm}>
              <Plus size={18} />
              Agregar empleado
            </button>
          )}
        </div>
      </section>

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
                {/* Subtítulo del modal con clase específica para no depender del layout de la página */}
                <p className="modal-subtitle">
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
              isOwner={(editingEmployee as any)?.isOwner ?? false}
              isNew={!editingEmployee}
            />
            {error && <p className="form-error">{error}</p>}
          </div>
        </div>
      )}

      <PasswordConfirmModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPendingEmployeeData(null);
        }}
        onConfirm={handlePasswordConfirm}
        title="Confirmar cambios"
        description="Ingresa tu contraseña para confirmar los cambios de usuario o contraseña"
      />
    </main>
  );
};

export default EmployeesPage;
