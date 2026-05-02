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
import { useAccountType } from "../../hooks/useAccountType";
import { getAuthToken } from "../../services/api";
import { getEmployeeById, getOwnerFromAPI } from "../../services/employees.service";
import type { Employee, EmployeeInput, EmployeeUpdate } from "../../types/employee.types";
import "../../styles/employees.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const EmployeesPage = () => {
  const navigate = useNavigate();
  const { isPremium } = usePlanAccess();
  const { isDemo, isOwner, employeeIdFromToken } = useAccountType();
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
    if (isDemo) {
      alert("Las cuentas demo tienen acceso restringido.");
      return false;
    }
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

  const openEditForm = async (employee: Employee) => {
    if (isDemo) {
      alert("Las cuentas demo tienen acceso restringido.");
      return;
    }
    
    // Si es el owner, obtener datos completos desde API
    if (!employee.id || employee.id <= 0) {
      const ownerData = await getOwnerFromAPI();
      if (ownerData) {
        setEditingEmployee(ownerData);
        setShowForm(true);
      } else {
        setEditingEmployee(employee);
        setShowForm(true);
      }
    } else {
      // Para empleados normales, obtener datos desde API
      const empData = await getEmployeeById(employee.id);
      if (empData) {
        setEditingEmployee(empData);
      } else {
        setEditingEmployee(employee);
      }
      setShowForm(true);
    }
  };

  const closeForm = () => {
    setEditingEmployee(null);
    setShowForm(false);
  };

  const hasSensitiveChange = (values: EmployeeInput, original?: Employee): boolean => {
    if (!original) return true;
    return true; // Siempre mostrar confirmación para cualquier cambio
  };

  const handleSubmit = async (values: EmployeeInput) => {
    if (isDemo) {
      alert("Las cuentas demo tienen acceso restringido.");
      return;
    }
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

    await executeSubmit(values);
  };

  const executeSubmit = async (values: EmployeeInput) => {
    try {
      if (editingEmployee) {
        const payload: Record<string, unknown> = { ...values };
        if (!payload.password || !(payload.password as string).trim()) {
          delete payload.password;
        }

        // Owner usa endpoint especial /api/tenants/owner
        if (!editingEmployee.id || editingEmployee.id <= 0) {
          if (!isOwner || !employeeIdFromToken) {
            console.error("executeSubmit: No se puede editar el owner sin employeeId del token");
            alert("Error: No se pudo identificar al owner.");
            closeForm();
            return;
          }
          const allowedOwnerFields = ["firstName", "lastName", "phone", "address", "documentNumber", "documentType", "notes", "username", "password"] as const;
          const ownerPayload: Record<string, string> = {};
          for (const key of allowedOwnerFields) {
            const val = values[key];
            if (val !== undefined && val !== null && val.trim() !== "") {
              ownerPayload[key] = val;
            }
          }
          const token = getAuthToken();
          const response = await fetch(`${API_BASE_URL}/api/tenants/owner`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(ownerPayload),
          });
          if (!response.ok) {
            const err = await response.json();
            alert(err.detail || "Error al actualizar owner");
            return;
          }
          // Guardar username actualizado del owner en localStorage para persistencia
          const updatedOwner = await response.json();
          const tenant = JSON.parse(localStorage.getItem("tenant") || "{}");
          if (updatedOwner.username) tenant.ownerUsername = updatedOwner.username;
          if (updatedOwner.firstName) tenant.ownerFirstName = updatedOwner.firstName;
          if (updatedOwner.lastName) tenant.ownerLastName = updatedOwner.lastName;
          localStorage.setItem("tenant", JSON.stringify(tenant));
          // Actualizar datos locales del owner directamente (no rely on refresh)
          if (editingEmployee && (!editingEmployee.id || editingEmployee.id <= 0)) {
            const updatedLocalEmp = {
              ...editingEmployee,
              username: updatedOwner.username || editingEmployee.username,
              firstName: updatedOwner.firstName || editingEmployee.firstName,
              lastName: updatedOwner.lastName || editingEmployee.lastName,
            };
            // Update via useEmployees state
            setEditingEmployee(updatedLocalEmp);
          }
          // Refrescar lista de empleados
          await refresh();
        } else {
          await updateEmployeeById(editingEmployee.id, payload as EmployeeUpdate);
        }
      } else {
        await addEmployee(values);
      }
      closeForm();
    } catch (err) {
      console.error("executeSubmit error:", err);
    }
  };

  const handlePasswordConfirm = async (password: string) => {
    if (!pendingEmployeeData) return;
    
    const token = getAuthToken();
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-password`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });
      
      if (!response.ok) {
        const err = await response.json();
        alert(err.detail || "Contraseña incorrecta");
        return;
      }
      
      setShowPasswordModal(false);
      await executeSubmit(pendingEmployeeData);
    } catch {
      alert("Error al verificar contraseña");
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
            onSelect={(id) => {
              if (id <= 0) {
                navigate("/employees/owner");
              } else {
                navigate(`/employees/${id}`);
              }
            }}
            onEdit={openEditForm}
            onDelete={handleDelete}
          />
        </div>
      </section>

      {showForm && (
        <div className="employee-modal-backdrop">
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
