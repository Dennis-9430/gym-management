/* Página de solicitud de recuperación de contraseña */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Building2, Loader2, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { buildUrl } from "../services/api";
import "../styles/login.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [businessCode, setBusinessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Ingresá tu correo o nombre de usuario.");
      return;
    }
    if (!businessCode.trim()) {
      setError("Ingresá el código del negocio.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(buildUrl("/api/tenants/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          businessCode: businessCode.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Error al procesar la solicitud.");
        return;
      }

      setSent(true);
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="login__container">
        <div className="login__card">
          <div className="login__header">
            <CheckCircle2 size={48} color="#22c55e" />
            <h1>Correo enviado</h1>
            <p>
              Si el correo existe en nuestro sistema, recibirás un enlace
              de recuperación en los próximos minutos.
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
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
            <Mail size={32} />
          </div>
          <h1>Recuperar contraseña</h1>
          <p>Ingresá tu correo y código del negocio</p>
        </div>

        <form onSubmit={handleSubmit} className="login__form">
          {error && (
            <div className="login__error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="login__field">
            <label htmlFor="email">
              <Mail size={16} />
              Correo o usuario
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="login__field">
            <label htmlFor="businessCode">
              <Building2 size={16} />
              Código del Negocio
            </label>
            <input
              id="businessCode"
              type="text"
              value={businessCode}
              onChange={(e) => setBusinessCode(e.target.value)}
              placeholder="ej: mi-gimnasio"
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="login__button" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="spin" size={20} />
            ) : (
              "Enviar enlace de recuperación"
            )}
          </button>

          <div style={{ textAlign: "center" }}>
            <Link to="/" className="login__back-link">
              <ArrowLeft size={16} />
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
