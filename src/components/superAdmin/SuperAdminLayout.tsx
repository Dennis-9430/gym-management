/* Layout compartido para páginas SUPER_ADMIN — navbar con logout */
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context";
import { Dumbbell, LogOut } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

const SuperAdminLayout = ({ children }: Props) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Top bar */}
      <div style={{
        backgroundColor: "#0f172a",
        color: "#fff",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 56,
      }}>
        {/* Left: logo + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Dumbbell size={22} color="#3b82f6" />
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff" }}>
            Gym Management
          </h1>
          <span style={{
            fontSize: 11,
            backgroundColor: "#3b82f6",
            padding: "2px 8px",
            borderRadius: 4,
            fontWeight: 700,
            letterSpacing: "0.05em",
          }}>
            SUPER ADMIN
          </span>
        </div>

        {/* Center: nav links */}
        <nav style={{ display: "flex", gap: 24, fontSize: 14 }}>
          <a
            href="/super-admin/dashboard"
            style={{
              color: "#cbd5e1",
              textDecoration: "none",
              fontWeight: 500,
              padding: "4px 0",
              borderBottom: "2px solid transparent",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#cbd5e1")}
          >
            Dashboard
          </a>
          <a
            href="/super-admin/tenants"
            style={{
              color: "#cbd5e1",
              textDecoration: "none",
              fontWeight: 500,
              padding: "4px 0",
              borderBottom: "2px solid transparent",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#cbd5e1")}
          >
            Tenants
          </a>
        </nav>

        {/* Right: logout */}
        <button
          onClick={handleLogout}
          title="Cerrar sesión"
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
          onMouseOver={(e) => {
            e.currentTarget.style.color = "#ef4444";
            e.currentTarget.style.borderColor = "#ef4444";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = "#94a3b8";
            e.currentTarget.style.borderColor = "#334155";
          }}
        >
          <LogOut size={15} />
          Salir
        </button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
        {children}
      </div>
    </div>
  );
};

export default SuperAdminLayout;
