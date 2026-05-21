/* Layout compartido para páginas SUPER_ADMIN — navbar con hamburguesa responsive */
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context";
import { Dumbbell, LogOut, Menu, X } from "lucide-react";

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

  const navItems = [
    { label: "Dashboard", href: "/super-admin/dashboard" },
    { label: "Tenants", href: "/super-admin/tenants" },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <style>{`
        .sa-nav-desktop { display: flex; }
        .sa-hamburger { display: none; }
        .sa-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 998;
        }
        .sa-drawer {
          position: fixed;
          top: 0;
          right: -280px;
          width: 260px;
          height: 100vh;
          background: #0f172a;
          z-index: 999;
          transition: right 0.25s ease;
          display: flex;
          flex-direction: column;
          padding: 20px;
        }
        .sa-drawer--open { right: 0; }
        .sa-overlay--visible { display: block; }

        @media (max-width: 640px) {
          .sa-nav-desktop { display: none; }
          .sa-hamburger { display: flex; }
        }
      `}</style>

      {/* Overlay */}
      <div
        className={`sa-overlay ${menuOpen ? "sa-overlay--visible" : ""}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Drawer */}
      <div className={`sa-drawer ${menuOpen ? "sa-drawer--open" : ""}`}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Dumbbell size={22} color="#3b82f6" />
            <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>Gym Manager</span>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  color: isActive ? "#fff" : "#94a3b8",
                  textDecoration: "none",
                  fontSize: 15,
                  fontWeight: isActive ? 600 : 400,
                  padding: "10px 12px",
                  borderRadius: 8,
                  backgroundColor: isActive ? "#1e293b" : "transparent",
                  transition: "all 0.15s",
                }}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <button
          onClick={() => { setMenuOpen(false); handleLogout(); }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "none",
            border: "1px solid #334155",
            borderRadius: 8,
            color: "#ef4444",
            cursor: "pointer",
            padding: "10px 14px",
            fontSize: 14,
            fontWeight: 500,
            width: "100%",
            justifyContent: "center",
          }}
        >
          <LogOut size={16} />
          Salir
        </button>
      </div>

      {/* Top bar */}
      <div style={{
        backgroundColor: "#0f172a",
        color: "#fff",
        padding: "0 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 56,
      }}>
        {/* Left: logo + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <Dumbbell size={22} color="#3b82f6" />
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>
            Gym Management
          </h1>
          <span style={{
            fontSize: 11,
            backgroundColor: "#3b82f6",
            padding: "2px 8px",
            borderRadius: 4,
            fontWeight: 700,
            letterSpacing: "0.05em",
            whiteSpace: "nowrap",
          }}>
            SUPER ADMIN
          </span>
        </div>

        {/* Right: desktop nav + hamburger */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <nav className="sa-nav-desktop" style={{ gap: 16, fontSize: 14 }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  style={{
                    color: isActive ? "#fff" : "#cbd5e1",
                    textDecoration: "none",
                    fontWeight: isActive ? 600 : 500,
                    padding: "4px 0",
                    borderBottom: isActive ? "2px solid #3b82f6" : "2px solid transparent",
                  }}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="sa-nav-desktop" style={{ width: 1, height: 24, backgroundColor: "#334155" }} />

          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="sa-nav-desktop"
            style={{
              background: "none",
              border: "1px solid #334155",
              borderRadius: 8,
              color: "#94a3b8",
              cursor: "pointer",
              padding: "8px 14px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 500,
              transition: "all 0.15s",
            }}
          >
            <LogOut size={15} />
            Salir
          </button>

          <button
            className="sa-hamburger"
            onClick={() => setMenuOpen(true)}
            style={{
              background: "none",
              border: "1px solid #334155",
              borderRadius: 8,
              color: "#94a3b8",
              cursor: "pointer",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
        {children}
      </div>
    </div>
  );
};

export default SuperAdminLayout;
