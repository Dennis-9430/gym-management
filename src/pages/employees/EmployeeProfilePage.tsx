/* Pagina de perfil de empleado con permisos */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Shield, Edit } from "lucide-react";
import EmployeePermissions from "../../components/employees/EmployeePermissions";
import { getEmployeeById, getOwnerFromAPI } from "../../services/employees.service";
import { useAccountType } from "../../hooks/useAccountType";
import "../../styles/clientProfileCss/ClientProfile.css";

const EmployeeProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isOwner: currentUserIsOwner, isAdmin, isRecepcionista: isRecepcionistaUser, employeeIdFromToken } = useAccountType();

  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEmployee = async () => {
      setLoading(true);
      setError(null);
      const idStr = String(id || "");
      
      try {
        // "owner" → ir a API del owner
        if (idStr === "owner") {
          const ownerData = await getOwnerFromAPI();
          if (ownerData) {
            setEmployee(ownerData);
          } else {
            setError("No se pudo cargar el perfil del owner");
          }
        } else {
          // Para ObjectId o número → getEmployeeById
          const empData = await getEmployeeById(idStr);
          if (empData) {
            setEmployee(empData);
          } else {
            setError("Empleado no encontrado");
          }
        }
      } catch (err) {
        console.error("Error cargando empleado:", err);
        setError("Error al cargar el perfil");
      }
      setLoading(false);
    };
    
    loadEmployee();
  }, [id]);

  if (loading) {
    return (
      <main className="client-profile-container">
        <div className="loading-state">
          <p>Cargando perfil...</p>
        </div>
      </main>
    );
  }

  if (error || !employee) {
    return (
      <main className="client-profile-container">
        <div className="profile-header">
          <button className="btn-back" onClick={() => navigate("/employees")}>
            <ArrowLeft size={18} />
            Volver
          </button>
          <h2 className="profile-title">Error</h2>
        </div>
        <div className="card card-info">
          <p>{error || "Empleado no encontrado"}</p>
        </div>
      </main>
    );
  }

  // Determinar tipo de perfil
  const isOwnerProfile = id === "owner" || employee.isOwner === true;
  const isSelfProfile = employeeIdFromToken && (
    String(employeeIdFromToken) === String(id) ||
    (employee as any).isOwner === true
  );
  const isRecepcionistaProfile = employee.role === "RECEPCIONISTA";

  // Determinar permisos de visualización
  // Gerente, Admin y Recepcionista pueden ver perfiles
  const canViewProfile = true;

  // Determinar permisos de edición de perfil
  // - Gerente: puede editar a todos
  // - Admin: solo puede editar recepcionistas
  // - Recepcionista: NO puede editar a nadie
  const canEditProfile = currentUserIsOwner
    ? true // Gerente: puede editar a todos
    : (isAdmin && isRecepcionistaProfile); // Admin: solo puede editar recepcionistas

  // Determinar permisos para gestionar permisos de empleados
  // - Gerente: puede gestionar permisos de todos
  // - Admin: solo puede gestionar permisos de recepcionistas
  // - Recepcionista: NO puede gestionar permisos de nadie
  const canManagePermissions = currentUserIsOwner
    ? true // Gerente: puede gestionar permisos de todos
    : (isAdmin && isRecepcionistaProfile && !isRecepcionistaUser); // Admin: solo puede gestionar permisos de recepcionistas (no su propio perfil)
  
  if (!canViewProfile && !currentUserIsOwner) {
    return (
      <main className="client-profile-container">
        <div className="profile-header">
          <button className="btn-back" onClick={() => navigate("/employees")}>
            <ArrowLeft size={18} />
            Volver
          </button>
        </div>
        <div className="card card-info">
          <p>No tienes permisos para ver este perfil.</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="client-profile-container">
        <div className="profile-header">
          <button className="btn-back" onClick={() => navigate("/employees")}>
            <ArrowLeft size={18} />
            Volver
          </button>
          <h2 className="profile-title">
            {isOwnerProfile ? "Perfil del Gerente" : isSelfProfile ? "Mi Perfil" : "Perfil del Empleado"}
          </h2>
          {/* Botón editar: solo para Gerente (cualquier empleado) y Admin (solo recepcionistas) */}
          {canEditProfile && !isRecepcionistaUser && (
            <button
              className="btn-edit-profile"
              onClick={() => navigate("/employees")}
            >
              <Edit size={16} />
              Editar
            </button>
          )}
        </div>

        <div className="profile-grid">
          <div className="card card-info">
            <h3>Información General</h3>
            <div className="info-row">
              <span className="info-label">Usuario:</span>
              <span className="info-value">{employee.username}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Nombre:</span>
              <span className="info-value">{employee.firstName} {employee.lastName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Cédula:</span>
              <span className="info-value">{employee.documentNumber || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{employee.email || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Teléfono:</span>
              <span className="info-value">{employee.phone || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Dirección:</span>
              <span className="info-value">{employee.address || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Rol:</span>
              <span className="info-value badge">{employee.role}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Estado:</span>
              <span className="info-value badge">{employee.status}</span>
            </div>
            {employee.notes && (
              <div className="info-row">
                <span className="info-label">Notas:</span>
                <span className="info-value">{employee.notes}</span>
              </div>
            )}
            <div className="info-row">
              <span className="info-label">Creado:</span>
              <span className="info-value">
                {employee.createdAt ? new Date(employee.createdAt).toLocaleDateString("es-ES") : "N/A"}
              </span>
            </div>
          </div>
        </div>

{/* Sección de permisos del Empleado (solo Gerente o Admin viendo perfil de otro) */}
        {!isOwnerProfile && (currentUserIsOwner || isAdmin) && !isRecepcionistaUser && (
          <div className="permissions-section">
            <div className="permissions-header">
              <Shield size={20} />
              <h3>Permisos del Empleado</h3>
            </div>
            <EmployeePermissions
              role={employee.role}
              isAdmin={isAdmin}
              employeeId={employee.id}
              isOwnerManaging={currentUserIsOwner}
            />
          </div>
        )}

        {/* Sección de permisos del GERENTE (cuando ve su propio perfil) */}
        {isOwnerProfile && currentUserIsOwner && (
          <div className="permissions-section permissions-section--readonly">
            <div className="permissions-header">
              <Shield size={20} />
              <h3>Mis Permisos</h3>
            </div>
            <p className="permissions-notice">
              Tienes acceso completo a todas las funciones del sistema.
            </p>
            <EmployeePermissions
              role="GERENTE"
              isAdmin={false}
              employeeId={employee.id}
              isOwnerManaging={false}
              isReadOnly={true}
            />
          </div>
        )}

        {/* Recepcionista viendo perfil - solo puede ver, no editar ni ver permisos */}
        {isRecepcionistaUser && (
          <div className="self-profile-notice">
            <p>No tienes permisos para editar empleados ni gestionar permisos.</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default EmployeeProfilePage;