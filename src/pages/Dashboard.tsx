import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1>Dashboard Empleado</h1>
      <p>Bienvenido {user?.username}</p>
      <p>Aquí puedes registrar clientes y asistencias.</p>
    </div>
  );
};

export default Dashboard;
