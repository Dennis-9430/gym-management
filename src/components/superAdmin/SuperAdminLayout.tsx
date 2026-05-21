/* Layout compartido para páginas SUPER_ADMIN — navbar con hamburguesa responsive */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context";
import { Dumbbell, LogOut, Menu, X } from "lucide-react";
import "../../styles/super-admin.css";

interface Props {
  children: React.ReactNode;
}

const SuperAdminLayout = ({ children }: Props) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Prevenir scroll del body Y html cuando el drawer está abierto
  useEffect(() => {
    if (menuOpen) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const navItems = [
    { label: "Dashboard", href: "/super-admin/dashboard" },
    { label: "Tenants", href: "/super-admin/tenants" },
  ];

  return (
    <div className="sa-layout">
      {/* Overlay */}
      <div
        className={`sa-overlay ${menuOpen ? "sa-overlay--visible" : ""}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Drawer */}
      <div className={`sa-drawer ${menuOpen ? "sa-drawer--open" : ""}`}>
        <div className="sa-drawer__header">
          <div className="sa-drawer__brand">
            <Dumbbell size={22} color="#3b82f6" />
            <span className="sa-drawer__brand-text">Gym Manager</span>
          </div>
          <button className="sa-drawer__close" onClick={() => setMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sa-drawer__nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`sa-drawer__link ${isActive ? "sa-drawer__link--active" : ""}`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="sa-drawer__footer">
          <button
            className="sa-drawer__logout"
            onClick={() => { setMenuOpen(false); handleLogout(); }}
          >
            <LogOut size={16} />
            Salir
          </button>
        </div>
      </div>

      {/* Top bar */}
      <div className="sa-topbar">
        {/* Left: logo + title */}
        <div className="sa-topbar__left">
          <Dumbbell size={22} color="#3b82f6" />
          <h1 className="sa-topbar__title">Gym Management</h1>
          <span className="sa-badge">SUPER ADMIN</span>
        </div>

        {/* Right: desktop nav + hamburger */}
        <div className="sa-topbar__right">
          <nav className="sa-nav-desktop sa-nav-desktop--nav">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`sa-nav-desktop__link ${isActive ? "sa-nav-desktop__link--active" : ""}`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="sa-nav-desktop sa-nav-desktop__separator" />

          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="sa-nav-desktop sa-nav-desktop__logout"
          >
            <LogOut size={15} />
            Salir
          </button>

          <button
            className="sa-hamburger"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="sa-content">
        {children}
      </div>
    </div>
  );
};

export default SuperAdminLayout;
