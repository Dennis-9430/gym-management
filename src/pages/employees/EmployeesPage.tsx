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
import { useAuth } from "../../context";
import { getAuthToken } from "../../services/api";
import { getEmployeeById, getOwnerFromAPI } from "../../services/employees.service";
import type { Employee, EmployeeInput, EmployeeUpdate } from "../../types/employee.types";
import "../../styles/employees.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const EmployeesPage = () => {
  const navigate = useNavigate();
  const { isPremium } = usePlanAccess();
  const { isDemo, isOwner, employeeIdFromToken } = useAccountType();
  const { user } = useAuth();
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

    // Gerente y Admin pueden crear empleados
    if (!isOwner && user?.role !== "ADMIN") {
      alert("No tienes permisos para crear empleados.");
      return false;
    }

    // PREMIUM: 3 admins (incluyendo owner) + 3 recepcionistas = 6 total
    const admins = employees.filter(e => e.role === "ADMIN" || (e as any).isOwner);
    const recepcionistas = employees.filter(e => e.role === "RECEPCIONISTA");

    if (isPremium()) {
      if (admins.length >= 3) {
        alert("Has alcanzado el límite máximo de 3 administradores en tu plan.");
        return false;
      }
      if (recepcionistas.length >= 3) {
        alert("Has alcanzado el límite máximo de 3 empleados recepcionistas en tu plan.");
        return false;
      }
    } else {
      // BASIC: solo el owner
      alert("En el plan BASIC solo tienes el Owner. ¡Upgrade a PREMIUM para agregar empleados!");
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

    const isGerente = (employee as any).isOwner === true;
    const isAdmin = employee.role === "ADMIN" && !isGerente;
    const isRecepcionista = employee.role === "RECEPCIONISTA";

    // Gerente: puede editar a todos (incluyendo su propia fila)
    // Admin: solo puede editar recepcionistas (NO admins, NO gerente)
    if (isOwner) {
      // Gerente: puede editar a cualquiera (incluyendo su propia fila para editar sus datos)
      // El formulario bloqueará campos sensibles (email, rol, estatus)
      // Se permite la edición sin restricciones
    } else if (user?.role === "ADMIN") {
      // Admin: solo puede editar recepcionistas
      if (!isRecepcionista) {
        alert("No tienes permisos para editar a este empleado.");
        return;
      }
    } else {
      alert("No tienes permisos para editar empleados.");
      return;
    }

    // Si es el owner, obtener datos completos desde API
    if (isGerente) {
      const ownerData = await getOwnerFromAPI();
      if (ownerData) {
        setEditingEmployee(ownerData);
        setShowForm(true);
      } else {
        setEditingEmployee(employee);
        setShowForm(true);
      }
    } else {
      // Validar que el empleado tenga un ID válido (no undefined, null, 0, "0", "owner")
      const empId = employee.id as number | string;
      
      if (!empId || empId === 0 || empId === "0" || empId === "owner") {
        setEditingEmployee(employee);
        setShowForm(true);
        return;
      }
      
      // Para empleados normales, obtener datos desde API
      const empData = await getEmployeeById(empId);
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

  const hasSensitiveChange = (_values: EmployeeInput, original?: Employee): boolean => {
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
      const admins = employees.filter(e => e.role === "ADMIN" || (e as any).isOwner);
      const recepcionistas = employees.filter(e => e.role === "RECEPCIONISTA");
      
      if (values.role === "ADMIN" && admins.length >= 3) {
        alert("Has alcanzado el límite máximo de 3 administradores en tu plan.");
        return;
      }
      if (values.role === "RECEPCIONISTA" && recepcionistas.length >= 3) {
        alert("Has alcanzado el límite máximo de 3 empleados recepcionistas en tu plan.");
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

        // Si es el owner, usar endpoint especial /api/tenants/owner
        if ((editingEmployee as any).isOwner === true) {
        if (!isOwner || !employeeIdFromToken) {
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
          // Refrescar lista de empleados
          await refresh();
        } else if (editingEmployee.id && editingEmployee.id !== "owner") {
          // Verificar que el ID sea válido (número > 0 o string ObjectId válida)
          const idStr = editingEmployee.id as string;
          const idNum = parseInt(idStr, 10);
          const isValidObjectId = /^[a-fA-F0-9]{24}$/.test(idStr);
          const isValidNumber = !Number.isNaN(idNum) && idNum > 0;
          
          if (!isValidObjectId && !isValidNumber) {
            alert("Error: No se puede identificar el empleado a editar.");
            closeForm();
            return;
          }
          // Empleado normal: usar /api/employees/{id}
          // Enviar payload completo, el backend maneja el hashing de password
          const payload: Record<string, unknown> = { ...values };
          await updateEmployeeById(editingEmployee.id, payload as EmployeeUpdate);
        }
      } else {
        await addEmployee(values);
      }
      closeForm();
    } catch (err) {
      // Error handled silently
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

  const handleDelete = (id: number | string) => {
    if (isDemo) {
      alert("Las cuentas demo tienen acceso restringido.");
      return;
    }
    
    // Encontrar el empleado a eliminar
    const employeeToDelete = employees.find(e => {
      const empId = e.id as number | string;
      return String(empId) === String(id) || empId === id;
    });
    
    if (!employeeToDelete) {
      alert("Empleado no encontrado.");
      return;
    }
    
    const isTargetOwner = (employeeToDelete as any).isOwner === true;
    const isTargetAdmin = employeeToDelete.role === "ADMIN" && !isTargetOwner;
    const isTargetRecepcionista = employeeToDelete.role === "RECEPCIONISTA";
    const isTargetSelf = employeeIdFromToken && String(employeeIdFromToken) === String(id);
    
    // Validaciones de permisos:
    // 1. Nadie puede eliminarse a sí mismo
    if (isTargetSelf) {
      alert("No puedes eliminarte a ti mismo.");
      return;
    }
    
    // 2. Nadie puede eliminar al owner
    if (isTargetOwner) {
      alert("No puedes eliminar al owner.");
      return;
    }
    
    // 3. Admin solo puede eliminar recepcionistas (NO admins, NO owner, NO sí mismo)
    // 4. Owner puede eliminar admins y recepcionistas (ya se validó que no es owner ni self)
    if (user?.role === "ADMIN" && !isTargetRecepcionista) {
      alert("No tienes permisos para eliminar a este empleado.");
      return;
    }
    
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
          {isDemo ? (
            <div className="pro-feature-locked" style={{ cursor: "not-allowed" }}>
              <Lock size={16} />
              <p>Agregar empleado</p>
              <span className="pro-badge">DEMO</span>
            </div>
          ) : !isPremium() ? (
            <div className="pro-feature-locked" style={{ cursor: "not-allowed" }}>
              <Lock size={16} />
              <p>Agregar empleado</p>
              <span className="pro-badge">BASIC</span>
            </div>
          ) : (() => {
            const admins = employees.filter(e => e.role === "ADMIN" || (e as any).isOwner);
            const recepcionistas = employees.filter(e => e.role === "RECEPCIONISTA");
            const atLimit = admins.length >= 3 && recepcionistas.length >= 3;
            if (atLimit) {
              return (
                <div className="pro-feature-locked" style={{ cursor: "not-allowed" }}>
                  <Lock size={16} />
                  <p>Límite alcanzado</p>
                  <span className="pro-badge">PREMIUM</span>
                </div>
              );
            }
            return (
              <button className="employee-add-btn" onClick={openNewForm}>
                <Plus size={18} />
                Agregar empleado
              </button>
            );
          })()}
        </div>
      </section>

      <section className="employees-list">
        <div className="employees-table-wrapper">
          <EmployeeTable
            employees={employees}
            onSelect={(id) => {
              const idStr = String(id);
              
              // Solo "owner" string va al perfil del owner
              if (idStr === "owner") {
                navigate("/employees/owner");
              } else {
                // ObjectId o número → perfil del empleado
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
