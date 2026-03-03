import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1>Panel Administrativo</h1>
      <p>Bienvenido {user?.username}</p>
      <h3>Resumen Financiero</h3>
      <p>Ingreso del dia</p>
      <p>Ingreso del mes</p>
    </div>
  );
};

export default Dashboard;
