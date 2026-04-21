import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/index.ts";
import "../styles/navbar.css";
import {
  User,
  LayoutDashboard,
  LogOut,
  Dumbbell,
} from "lucide-react";

/* Barra de navegacion principal con logout */
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getDisplayName = () => {
    if (!user) return "";
    if (user.role === "ADMIN") {
      return `admin - ${user.username}`;
    }
    return user.username;
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
                <span className="navbar__username-text">{getDisplayName()}</span>
              </span>
            )}
          </h1>
        </div>

          {user && (
            <div className="nav-actions">
              <NavLink className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`} to="/dashboard">
                <LayoutDashboard size={16} />
                Panel Principal
              </NavLink>

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
