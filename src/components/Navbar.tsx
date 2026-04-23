import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/index.ts";
import "../styles/navbar.css";
import {
  User,
  LayoutDashboard,
  LogOut,
  Dumbbell,
} from "lucide-react";

/**
 * Componente de barra de navegación principal.
 * Proporciona navegación global y funcionalidad de logout para la aplicación.
 * Muestra el branding del gimnasio, información del usuario autenticado
 * y enlaces de navegación cuando hay sesión activa.
 * 
 * @returns {JSX.Element} Barra de navegación renderizada
 */
const Navbar = () => {
  // Obtenemos el usuario actual y la función de logout del contexto de autenticación
  const { user, logout } = useAuth();
  // Hook para navegación programática
  const navigate = useNavigate();

  /**
   * Maneja el cierre de sesión del usuario.
   * Ejecuta el logout a través del contexto de autenticación
   * y redirige al usuario a la página principal.
   * 
   * @returns {void}
   */
  const handleLogout = () => {
    // Llama a la función de logout del contexto auth
    logout();
    // Redirige al usuario a la página principal ("/")
    navigate("/");
  };

  /**
   * Genera el nombre a visualizar en la barra de navegación.
   * Para usuarios ADMIN, prepende el rol al nombre de usuario.
   * Para otros usuarios, retorna solo el nombre de usuario.
   * 
   * @returns {string} Nombre formateado para mostrar
   */
  const getDisplayName = () => {
    // Retorna cadena vacía si no hay usuario autenticado
    if (!user) return "";
    // Si el usuario es ADMIN, prepende "admin - " al username
    if (user.role === "ADMIN") {
      return `admin - ${user.username}`;
    }
    // Para usuarios no admin, retorna solo el nombre de usuario
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
