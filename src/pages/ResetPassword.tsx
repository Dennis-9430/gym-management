/* Página de restablecimiento de contraseña */
import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Lock, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { buildUrl } from "../services/api";
import "../styles/login.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Token de recuperación inválido o faltante.");
      return;
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(buildUrl("/api/tenants/reset-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Error al restablecer la contraseña.");
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate("/", { replace: true }), 3000);
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="login__container">
        <div className="login__card">
          <div className="login__header">
            <h1>Enlace inválido</h1>
            <p>El enlace de recuperación no es válido o está incompleto.</p>
            <Link to="/" className="login__back-link">
              <ArrowLeft size={16} />
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login__container">
      <div className="login__card">
        <div className="login__header">
          <div className="login__logo">
            <Lock size={32} />
          </div>
          <h1>Restablecer contraseña</h1>
          <p>Ingresá tu nueva contraseña</p>
        </div>

        {success ? (
          <div className="login__success">
            <CheckCircle2 size={48} color="#22c55e" />
            <h2>Contraseña actualizada</h2>
            <p>Redirigiendo al inicio de sesión...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login__form">
            {error && (
              <div className="login__error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="login__field">
              <label htmlFor="newPassword">Nueva contraseña</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                disabled={isLoading}
                autoFocus
              />
            </div>

            <div className="login__field">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repetí la contraseña"
                disabled={isLoading}
              />
            </div>

            <button type="submit" className="login__button" disabled={isLoading}>
              {isLoading ? <Loader2 className="spin" size={20} /> : "Restablecer contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
