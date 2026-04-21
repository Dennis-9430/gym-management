import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context";

/* Protege rutas verificando autenticacion */
export const ProtectedRoute = () => {
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

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
