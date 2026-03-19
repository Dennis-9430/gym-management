import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/index.ts";
import "../styles/navbar.css";
import {
  User,
  LayoutDashboard,
  LogOut,
  Dumbbell,
  DoorOpen,
} from "lucide-react";
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const handleOpenDoor = () => {
    alert("Puerta abierta correctamente");
    // Aquí luego irá la integración con hardware o backend
  };
  return (
    <nav className="navbar">
      <div className="navbar__containner">
        <div className="navbar__brand">
          <Dumbbell size={22} />
          <h1>
            Gym Management
            {user && (
              <span className="navbar__username">
                <User size={22} />
                {user.username}
              </span>
            )}
          </h1>
        </div>

        {user && (
          <div className="nav-actions">
            <button className="navbar__btn" onClick={handleOpenDoor}>
              <DoorOpen size={16} />
              Abrir
            </button>

            <Link className="navbar__link" to="/dashboard">
              <LayoutDashboard size={16} />
              Panel Principal
            </Link>

            <button className="navbar__logout" onClick={handleLogout}>
              <LogOut size={16} />
              Cerrar Sesíon
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
