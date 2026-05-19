import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context";

/* Protege rutas para SUPER_ADMIN solamente */
export const SuperAdminRoute = () => {
  const { user, isInitialized } = useAuth();

  if (!isInitialized) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  if (user.role !== "SUPER_ADMIN") return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};
