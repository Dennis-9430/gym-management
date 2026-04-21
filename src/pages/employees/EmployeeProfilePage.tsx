/* Pagina de perfil de empleado con permisos */
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/index.ts";
import EmployeePermissions from "../../components/employees/EmployeePermissions";
import { getEmployeeById } from "../../services/employees.service";
import "../../styles/clientProfileCss/ClientProfile.css";

const EmployeeProfilePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const employee = useMemo(() => {
    const parsedId = Number(id);
    if (Number.isNaN(parsedId)) return null;
    return getEmployeeById(parsedId);
  }, [id]);

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
              <strong>Direccion:</strong> {employee.address}
            </p>
            <p>
              <strong>Rol:</strong> {employee.role}
            </p>
            <p>
              <strong>Estado:</strong> {employee.status}
            </p>
            <p>
              <strong>Observaciones:</strong> {employee.notes || "-"}
            </p>
            <p>
              <strong>Registrado:</strong>{" "}
              {new Date(employee.createdAt).toLocaleDateString()}
            </p>
          </div>

          <EmployeePermissions 
            role={employee.role} 
            isAdmin={user?.role === "ADMIN"}
            employeeId={employee.id}
          />
        </div>
      </div>
    </main>
  );
};

export default EmployeeProfilePage;
