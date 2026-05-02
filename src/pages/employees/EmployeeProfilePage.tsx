/* Pagina de perfil de empleado con permisos */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/index.ts";
import EmployeePermissions from "../../components/employees/EmployeePermissions";
import { getEmployeeById, getOwnerFromAPI } from "../../services/employees.service";
import "../../styles/clientProfileCss/ClientProfile.css";

const EmployeeProfilePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmployee = async () => {
      setLoading(true);
      const parsedId = Number(id);
      
      if (id === "owner" || parsedId <= 0) {
        // Owner: obtener desde API
        const ownerData = await getOwnerFromAPI();
        setEmployee(ownerData);
      } else if (!Number.isNaN(parsedId)) {
        const empData = await getEmployeeById(parsedId);
        setEmployee(empData);
      }
      setLoading(false);
    };
    
    loadEmployee();
  }, [id]);

  if (loading) {
    return (
      <main className="client-profile-container">
        <p>Cargando...</p>
      </main>
    );
  }

  if (!employee) {
    return (
      <main className="client-profile-container">
        <p>Empleado no encontrado</p>
        <button className="btn-back" onClick={() => navigate("/employees")}>
          <ArrowLeft size={18} />
          Volver
        </button>
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
          <h2 className="profile-title">Perfil del Empleado</h2>
        </div>

        <div className="profile-grid">
          <div className="card card-info">
            <h3>Informacion General</h3>
            <p>
              <strong>Usuario:</strong> {employee.username}
            </p>
            <p>
              <strong>Nombre:</strong> {employee.firstName} {employee.lastName}
            </p>
            <p>
              <strong>Cedula:</strong> {employee.documentNumber}
            </p>
            <p>
              <strong>Email:</strong> {employee.email}
            </p>
            <p>
              <strong>Telefono:</strong> {employee.phone}
            </p>
            <p>
              <strong>Direccion:</strong> {employee.address || "N/A"}
            </p>
            <p>
              <strong>Rol:</strong> {employee.role}
            </p>
            <p>
              <strong>Estado:</strong> {employee.status}
            </p>
            <p>
              <strong>Notas:</strong> {employee.notes || "Sin notas"}
            </p>
            <p>
              <strong>Creado:</strong> {employee.createdAt ? new Date(employee.createdAt).toLocaleDateString("es-ES") : "N/A"}
            </p>
          </div>
        </div>

        {user?.role === "ADMIN" && (
          <div className="permissions-section">
            <h3>Permisos del Empleado</h3>
            <EmployeePermissions 
              role={employee.role} 
              isAdmin={user?.role === "ADMIN"} 
              employeeId={employee.id} 
            />
          </div>
        )}
      </div>
    </main>
  );
};

export default EmployeeProfilePage;