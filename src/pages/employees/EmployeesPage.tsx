/* Pagina de gestion de empleados */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, Lock } from "lucide-react";
import EmployeeForm from "../../components/employees/EmployeeForm";
import EmployeeSearch from "../../components/employees/EmployeeSearch";
import EmployeeTable from "../../components/employees/EmployeeTable";
import PasswordConfirmModal from "../../components/employees/PasswordConfirmModal";
import BackButton from "../../components/common/BackButton";
import { useEmployees } from "../../hooks/useEmployees";
import { usePlanAccess } from "../../hooks/usePlanAccess";
import { useAccountType } from "../../hooks/useAccountType";
import { useAuth } from "../../context";
import {
  getEmployeeById,
  getOwnerFromAPI,
  updateOwnerProfile,
  verifyCurrentPassword,
} from "../../services/employees.service";
import { buildUrl, getAuthHeaders } from "../../services/api";
import type { Employee, EmployeeInput, EmployeeUpdate } from "../../types/employee.types";
import "../../styles/employees.css";

const EmployeesPage = () => {
  const navigate = useNavigate();
  const { isPremium } = usePlanAccess();
  const { isOwner, employeeIdFromToken } = useAccountType();
  const { user } = useAuth();
  const {
    employees,
    search,
    setSearch,
    error,
    refresh,
    addEmployee,
    updateEmployeeById,
    removeEmployee,
  } = useEmployees();

  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingEmployeeData, setPendingEmployeeData] = useState<EmployeeInput | null>(null);

  // Biometric fingerprint state
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    fetch(buildUrl("/api/fingerprints/biometric-config"), {
      headers: { ...getAuthHeaders() },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => setBiometricEnabled(d.biometricEnabled))
      .catch(() => {});
  }, []);

  const handleRegisterFingerprint = useCallback(async (employeeId: string) => {
    try {
      await fetch(buildUrl("/api/fingerprints/register"), {
        method: "POST",
        headers: { ...getAuthHeaders() },
        credentials: "include",
        body: JSON.stringify({ entityType: "employee", entityId: employeeId }),
      });
      refresh();
    } catch {
      alert("Error al registrar huella");
    }
  }, [refresh]);

  const handleDeleteFingerprint = useCallback(async (employeeId: string) => {
    try {
      await fetch(buildUrl(`/api/fingerprints/employee/${employeeId}`), {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
        credentials: "include",
      });
      refresh();
    } catch {
      alert("Error al borrar huella");
    }
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const canAddEmployee = () => {
    if (!isOwner && user?.role !== "ADMIN" && user?.role !== "GERENTE") {
      alert("No tienes permisos para crear empleados.");
      return false;
    }

    const admins = employees.filter((employee) => employee.role === "ADMIN" || employee.isOwner);
    const recepcionistas = employees.filter((employee) => employee.role === "RECEPCIONISTA");

    if (isPremium()) {
      if (admins.length >= 3) {
        alert("Has alcanzado el límite máximo de 3 administradores en tu plan.");
        return false;
      }
      if (recepcionistas.length >= 3) {
        alert("Has alcanzado el límite máximo de 3 empleados recepcionistas en tu plan.");
        return false;
      }
      return true;
    }

    alert("En el plan BASIC solo tienes el Owner. ¡Upgrade a PREMIUM para agregar empleados!");
    return false;
  };

  const openNewForm = () => {
    if (!canAddEmployee()) return;
    setEditingEmployee(null);
    setShowForm(true);
  };

  const openEditForm = async (employee: Employee) => {
    const isTargetOwner = employee.isOwner === true;
    const isRecepcionista = employee.role === "RECEPCIONISTA";

    if (!isOwner && user?.role !== "GERENTE") {
      if (user?.role !== "ADMIN" || !isRecepcionista) {
        alert("No tienes permisos para editar a este empleado.");
        return;
      }
    }

    try {
      if (isTargetOwner) {
        const ownerData = await getOwnerFromAPI();
        setEditingEmployee(ownerData ?? employee);
      } else if (/^[a-fA-F0-9]{24}$/.test(employee.id)) {
        const employeeData = await getEmployeeById(employee.id);
        setEditingEmployee(employeeData ?? employee);
      } else {
        setEditingEmployee(employee);
      }

      setShowForm(true);
    } catch {
      setEditingEmployee(employee);
      setShowForm(true);
    }
  };

  const closeForm = () => {
    setEditingEmployee(null);
    setShowForm(false);
  };

  const handleSubmit = async (values: EmployeeInput) => {
    if (!editingEmployee) {
      if (!isPremium()) {
        alert("En el plan BASIC solo tienes el Owner. ¡Upgrade a PREMIUM para agregar empleados!");
        return;
      }

      const admins = employees.filter((employee) => employee.role === "ADMIN" || employee.isOwner);
      const recepcionistas = employees.filter((employee) => employee.role === "RECEPCIONISTA");

      if (values.role === "ADMIN" && admins.length >= 3) {
        alert("Has alcanzado el límite máximo de 3 administradores en tu plan.");
        return;
      }
      if (values.role === "RECEPCIONISTA" && recepcionistas.length >= 3) {
        alert("Has alcanzado el límite máximo de 3 empleados recepcionistas en tu plan.");
        return;
      }
    }

    setPendingEmployeeData(values);
    setShowPasswordModal(true);
  };

  const executeSubmit = async (values: EmployeeInput) => {
    if (!editingEmployee) {
      await addEmployee(values);
      closeForm();
      return;
    }

    if (editingEmployee.isOwner) {
      if (!isOwner) {
        alert("Error: No se pudo identificar al owner.");
        closeForm();
        return;
      }

      const updatedOwner = await updateOwnerProfile(values);
      // VISUAL CACHE: actualiza localStorage("tenant") para reflejar cambios en UI.
      // Backend sigue siendo fuente de verdad del owner data.
      const tenant = JSON.parse(localStorage.getItem("tenant") || "{}");

      if (updatedOwner.username) tenant.ownerUsername = updatedOwner.username;
      if (updatedOwner.firstName) tenant.ownerFirstName = updatedOwner.firstName;
      if (updatedOwner.lastName) tenant.ownerLastName = updatedOwner.lastName;

      localStorage.setItem("tenant", JSON.stringify(tenant));
      await refresh();
      closeForm();
      return;
    }

    if (!/^[a-fA-F0-9]{24}$/.test(editingEmployee.id)) {
      alert("Error: No se puede identificar el empleado a editar.");
      closeForm();
      return;
    }

    await updateEmployeeById(editingEmployee.id, values as EmployeeUpdate);
    closeForm();
  };

  const handlePasswordConfirm = async (password: string) => {
    if (!pendingEmployeeData) return;

    try {
      await verifyCurrentPassword(password);
      setShowPasswordModal(false);
      await executeSubmit(pendingEmployeeData);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al verificar contraseña");
    }
  };

  const handleDelete = (id: string) => {
    const employeeToDelete = employees.find((employee) => employee.id === id);

    if (!employeeToDelete) {
      alert("Empleado no encontrado.");
      return;
    }

    const isTargetOwner = employeeToDelete.isOwner === true;
    const isTargetRecepcionista = employeeToDelete.role === "RECEPCIONISTA";
    const isTargetSelf = employeeIdFromToken ? String(employeeIdFromToken) === id : false;

    if (isTargetSelf) {
      alert("No puedes eliminarte a ti mismo.");
      return;
    }

    if (isTargetOwner) {
      alert("No puedes eliminar al owner.");
      return;
    }

    if (!isOwner && user?.role !== "GERENTE" && (user?.role !== "ADMIN" || !isTargetRecepcionista)) {
      alert("No tienes permisos para eliminar a este empleado.");
      return;
    }

    if (confirm("Deseas eliminar este empleado?")) {
      void removeEmployee(id);
    }
  };

  return (
    <main className="employees-container">
      <section className="employees-header">
        <div>
          <div className="page-header-row">
            <BackButton />
            <h2>Empleados</h2>
          </div>
          <p className="employees-subtitle">
            Gestiona el personal del gimnasio.
          </p>
        </div>
        <div className="employees-actions">
          <EmployeeSearch value={search} onChange={setSearch} />
          {!isPremium() ? (
            <div className="pro-feature-locked" style={{ cursor: "not-allowed" }}>
              <Lock size={16} />
              <p>Agregar empleado</p>
              <span className="pro-badge">BASIC</span>
            </div>
          ) : (() => {
            const admins = employees.filter((employee) => employee.role === "ADMIN" || employee.isOwner);
            const recepcionistas = employees.filter((employee) => employee.role === "RECEPCIONISTA");
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
        {error && (
          <div style={{
            padding: "12px 16px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 10,
            color: "#dc2626",
            fontSize: 14,
            fontWeight: 500,
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}
        <div className="employees-table-wrapper">
          <EmployeeTable
            employees={employees}
            biometricEnabled={biometricEnabled}
            onRegisterFingerprint={handleRegisterFingerprint}
            onDeleteFingerprint={handleDeleteFingerprint}
            onSelect={(id) => {
              if (id === "owner") {
                navigate("/employees/owner");
                return;
              }

              navigate(`/employees/${id}`);
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
            onClick={(event) => event.stopPropagation()}
          >
            <div className="employee-modal-header">
              <div>
                <h3>{editingEmployee ? "Editar empleado" : "Agregar empleado"}</h3>
                {/* El modal documenta su propio subtítulo para no depender del layout externo. */}
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
              isOwner={editingEmployee?.isOwner ?? false}
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
