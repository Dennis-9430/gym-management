import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  return (
    <nav>
      <h3> Gym Managament</h3>
      {user && (
        <>
          {user.role === "ADMIN" ? (
            <Link to="/admin">Admin Panel</Link>
          ) : (
            <Link to="/dashboard">Dashboard</Link>
          )}
          <button onClick={handleLogout}> Cerrar sesión</button>
        </>
      )}
    </nav>
  );
};

export default Navbar;
