/* Página de inicio de sesión (Tenant Login) */
import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/index.ts";
import type { AuthUser } from "../types/user.types";
import { Lock, Eye, EyeOff, Dumbbell, Loader2, Mail, AlertTriangle } from "lucide-react";
import "../styles/login.css";

interface TenantLoginResponse {
  accessToken: string;
  tenant: {
    tenantId: string;
    email: string;
    businessName: string;
    plan: string;
    subscriptionStatus: string;
  };
}

/* Página de inicio de sesión */
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Detectar si viene de demo y prellenar credenciales
  useEffect(() => {
    const isDemo = searchParams.get("demo") === "true";
    const demoPlan = searchParams.get("plan");
    
    if (isDemo) {
      // Buscar credenciales en localStorage o URL
      const creds = localStorage.getItem("demoCredentials");
      if (creds) {
        try {
          const data = JSON.parse(creds);
          setEmail(data.email || "");
          setPassword(data.password || "");
          
          // Limpiar URL después de usar
          navigate("/login", { replace: true });
        } catch {}
      }
    }
  }, [searchParams, navigate]);

  /* Valida que los campos no estén vacíos */
  const validateForm = (): boolean => {
    const errors = { email: "", password: "" };
    let isValid = true;

    if (!email.trim()) {
      errors.email = "El correo electrónico es requerido";
      isValid = false;
    }

    if (!password.trim()) {
      errors.password = "La contraseña es requerida";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  /* Envía credenciales al API de tenants */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/tenants/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data: TenantLoginResponse = await response.json();

      if (!response.ok) {
        const errorData = data as unknown as { detail?: string };
        throw new Error(errorData.detail || "Credenciales incorrectas");
      }

      // Guardar token y datos del tenant
      localStorage.setItem("tenantToken", data.accessToken);
      localStorage.setItem("tenant", JSON.stringify(data.tenant));

      // Login con datos del tenant
      const user: AuthUser = {
        username: data.tenant.businessName,
        role: "ADMIN",
        tenantId: data.tenant.tenantId,
        plan: data.tenant.plan as AuthUser["plan"],
        subscriptionStatus: data.tenant.subscriptionStatus as AuthUser["subscriptionStatus"]
      };

      login(user);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: "" }));
    }
    if (error) setError("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: "" }));
    }
    if (error) setError("");
  };

  return (
    <div className="login">
      <div className="login__split login__split--left">
        <div className="login__brand">
          <Dumbbell size={48} strokeWidth={1.5} />
          <h1>Gym Management</h1>
          <p>Sistema de gestión integral para tu gimnasio</p>
        </div>
        <div className="login__decoration">
          <div className="login__circle login__circle--1"></div>
          <div className="login__circle login__circle--2"></div>
          <div className="login__circle login__circle--3"></div>
        </div>
      </div>

      <div className="login__split login__split--right">
        <div className="login__card">
          <div className="login__header">
            <div className="login__icon">
              <Dumbbell size={32} strokeWidth={1.5} />
            </div>
            <h2 className="login__title">¡Bienvenido!</h2>
            <p className="login__subtitle">Inicia sesión para continuar</p>
          </div>

          <form className="login__form" onSubmit={handleSubmit}>
            {error && (
              <div className="login__error-global" role="alert">
                {error}
              </div>
            )}

            <div className="login__field">
              <label htmlFor="email" className="login__label">
                Correo Electrónico
              </label>
              <div className={`login__input-wrapper ${fieldErrors.email ? "login__input-wrapper--error" : ""}`}>
                <Mail size={18} className="login__input-icon" />
                <input
                  id="email"
                  className="login__input"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={handleEmailChange}
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
              {fieldErrors.email && (
                <span className="login__field-error">{fieldErrors.email}</span>
              )}
            </div>

            <div className="login__field">
              <label htmlFor="password" className="login__label">
                Contraseña
              </label>
              <div className={`login__input-wrapper ${fieldErrors.password ? "login__input-wrapper--error" : ""}`}>
                <Lock size={18} className="login__input-icon" />
                <input
                  id="password"
                  className="login__input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="login__toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <span className="login__field-error">{fieldErrors.password}</span>
              )}
            </div>

            <button
              className="login__button"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="login__spinner" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>

          <div className="login__register">
            <p>
              ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
            </p>
          </div>
          
          <div className="login__footer">
            <p>© 2024 Gym Management</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;