import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/index.ts";
import { useAccountType } from "../hooks/useAccountType";
import "../styles/navbar.css";
import {
  User,
  LayoutDashboard,
  LogOut,
  Dumbbell,
  Menu,
  X,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
} from "lucide-react";

/** @const Enlaces del menú de navegación */
const NAV_LINKS = [
  { to: "/dashboard", label: "Panel Principal", icon: LayoutDashboard },
  { to: "/clients/list", label: "Clientes", icon: Users },
  { to: "/products", label: "Productos", icon: Package },
  { to: "/sales", label: "Ventas", icon: ShoppingCart },
  { to: "/employees", label: "Empleados", icon: User },
  { to: "/financial", label: "Finanzas", icon: DollarSign },
];

/**
 * Componente de barra de navegación principal.
 * Proporciona navegación global y funcionalidad de logout para la aplicación.
 * Muestra el branding del gimnasio, información del usuario autenticado
 * y enlaces de navegación cuando hay sesión activa.
 *
 * @returns {JSX.Element} Barra de navegación renderizada
 */
const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Obtenemos el usuario actual y la función de logout del contexto de autenticación
  const { user, logout } = useAuth();
  const { isOwner } = useAccountType();
  // Hook para navegación programática
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";

  // VISUAL ONLY: isOwner, role, plan son para display del label de rol.
  // Backend valida permisos reales en cada request autenticado.

  /**
   * Maneja el cierre de sesión del usuario.
   * Ejecuta el logout a través del contexto de autenticación
   * y redirige al usuario a la página principal.
   *
   * @returns {void}
   */
  const handleLogout = async () => {
    // Llama a la función de logout del contexto auth (limpia datos demo si aplica)
    await logout();
    // Redirige al usuario a la página principal ("/")
    navigate("/");
  };

  /** Cierra el sidebar */
  const closeSidebar = () => setSidebarOpen(false);

  /**
   * Genera el label del rol para mostrar
   * Usa isOwner del hook para determinar correctamente el rol
   */
  const getRoleLabel = () => {
    if (isOwner) return "Gerente";
    if (user?.role === "ADMIN") return "Admin";
    return "Recepcionista";
  };

  /**
   * Genera el nombre a visualizar en la barra de navegación.
   * Muestra rol + nombre para cualquier usuario.
   *
   * @returns {string} Nombre formateado para mostrar
   */
  const getDisplayName = () => {
    // Retorna cadena vacía si no hay usuario autenticado
    if (!user) return "";
    // Formato: [Rol] - Nombre
    const roleLabel = getRoleLabel();
    return `${roleLabel} - ${user.username}`;
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar__containner">
          <div className="navbar__brand">
            <Dumbbell size={22} />
            <h1 className="navbar__brand-title">
              Gym Management
              {user && (
                <span className="navbar__username">
                  <User size={16} />
                  <span className="navbar__username-text">{getDisplayName()}</span>
                </span>
              )}
            </h1>
          </div>

          {user && (
            <div className="nav-actions">
              {/* Botón hamburguesa para el menú lateral */}
              <button
                className="navbar__hamburger"
                onClick={() => setSidebarOpen(true)}
                aria-label="Abrir menú de navegación"
                type="button"
              >
                <Menu size={20} />
              </button>

              {!isDashboard && (
                <NavLink className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`} to="/dashboard">
                  <LayoutDashboard size={16} />
                  Panel Principal
                </NavLink>
              )}

              <button className="navbar__logout" onClick={handleLogout} title="Cerrar Sesión">
                <LogOut size={16} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}

      {/* Sidebar / Drawer */}
      <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__header">
          <Dumbbell size={22} />
          <h2 className="sidebar__title">Gym Management</h2>
          <button
            className="sidebar__close"
            onClick={closeSidebar}
            aria-label="Cerrar menú"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {user && (
          <div className="sidebar__user-info">
            <User size={16} />
            <span>{getDisplayName()}</span>
          </div>
        )}

        <nav className="sidebar__nav">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/dashboard"}
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
                }
                onClick={closeSidebar}
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar__footer">
          <button className="sidebar__logout" onClick={handleLogout}>
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
};

export default Navbar;
