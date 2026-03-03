import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <div>
      <h1>Dashboard </h1>
      <div className="dashboard-grid">
        <button onClick={() => navigate("/clients/registrer")}>
          Registrar Cliente
        </button>
        <button onClick={() => navigate("/clientes")}>Lista de clientes</button>
        <button onClick={() => navigate("/produtcs")}> Productos</button>
        <button onClick={() => navigate("/sales")}> Punto de Venta</button>
        <button onClick={() => navigate("/payments")}>Registro Pago</button>
        {user?.role === "ADMIN" && (
          <>
            <button onClick={() => navigate("/employees")}>
              Registrar Personal
            </button>
            <button onClick={() => navigate("/finacial")}>
              Reporte Finaciero
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
