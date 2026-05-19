/* Página de inicio de sesión (Tenant Login) */
import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/index.ts";
import type { AuthUser } from "../types/user.types";
import { Lock, Eye, EyeOff, Dumbbell, Loader2, Mail, Building2 } from "lucide-react";
import { buildUrl } from "../services/api";
import "../styles/login.css";

interface TenantLoginResponse {
  accessToken: string;
  tenant: {
    tenantId: string;
    email: string;
    businessName: string;
    businessCode?: string;
    plan: string;
    subscriptionStatus: string;
    ownerFirstName?: string;
    ownerLastName?: string;
  };
}

/* Página de inicio de sesión */
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessCode, setBusinessCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "", businessCode: "" });
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Detectar mensaje de éxito del registro
  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
      setSuccessMessage(decodeURIComponent(message));
    }
    
    // businessCode solo desde URL (después de registro, ?code=mi-gimnasio).
    // NO leer de localStorage para que el campo arranque limpio al navegar al login.
    const urlCode = searchParams.get("code");
    if (urlCode) {
      setBusinessCode(urlCode);
    }
  }, [searchParams]);

  // Detectar si viene de demo y prellenar credenciales
  const [isDemoSession, setIsDemoSession] = useState(false);
  
  useEffect(() => {
    const isDemo = searchParams.get("demo") === "true";
    const planParam = searchParams.get("plan");
    
    if (isDemo) {
      const creds = localStorage.getItem("demoCredentials");
      if (creds) {
        try {
          const data = JSON.parse(creds);
          setEmail(data.email || "");
          setPassword(data.password || "");
          setIsDemoSession(true);
      } catch (e) {
        // Error parsing demo credentials
      }
      }
      
      // Pre-fill businessCode según el plan demo (fijo, coincide con seed data)
      const demoPlan = planParam || searchParams.get("plan") || "BASIC";
      setBusinessCode(demoPlan === "PREMIUM" ? "demo-premium" : "demo-basic");
    }
  }, [searchParams]);

  /* Valida que los campos no estén vacíos */
  const validateForm = (): boolean => {
    const errors = { email: "", password: "", businessCode: "" };
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
      // PUBLIC ENDPOINT: login no requiere token. Fetch directo intencional.
      const body: Record<string, string> = { email, password };
      // Enviar businessCode (slug) si el usuario lo ingresó
      if (businessCode.trim()) {
        body.businessCode = businessCode.trim();
      }
      // Si no hay businessCode, se envía solo email+password para
      // permitir login de SUPER_ADMIN (que no pertenece a un tenant)
      const response = await fetch(buildUrl("/api/tenants/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data: TenantLoginResponse = await response.json();

      if (!response.ok) {
        const errorData = data as unknown as { detail?: string };
        throw new Error(errorData.detail || "Credenciales incorrectas");
      }

      // Guardar token y datos del tenant
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("tenantId", data.tenant.tenantId);
      if (data.tenant.businessCode) {
        localStorage.setItem("businessCode", data.tenant.businessCode);
      }
      // Incluir ownerUsername en tenant si viene del backend
      const tenantData: Record<string, unknown> = { ...data.tenant };
      if ((data.tenant as any).ownerUsername) {
        tenantData.ownerUsername = (data.tenant as any).ownerUsername;
      }
      localStorage.setItem("tenant", JSON.stringify(tenantData));

      // Decodificar token para obtener rol real
      let userRole: "ADMIN" | "RECEPCIONISTA" | "GERENTE" | "SUPER_ADMIN" = "ADMIN";
      let payload: Record<string, unknown> = {};
      try {
        const base64Url = data.accessToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        payload = JSON.parse(atob(base64));
        userRole = (payload.role as "ADMIN" | "RECEPCIONISTA" | "GERENTE" | "SUPER_ADMIN") || "ADMIN";
      } catch {
        // Usar ADMIN por defecto si no se puede decodificar
      }

      // Guardar flag si es demo
      const isDemo = new URLSearchParams(window.location.search).get("demo") === "true";
      if (isDemo) {
        localStorage.setItem("isDemo", "true");
      } else {
        localStorage.removeItem("isDemo");
      }

      // Si es SUPER_ADMIN, redirigir al panel de administración de tenants
      if (userRole === "SUPER_ADMIN") {
        const user: AuthUser = {
          username: data.tenant?.businessName || (payload.sub as string) || "Admin",
          role: "SUPER_ADMIN",
          tenantId: undefined,
        };
        login(user);
        navigate("/super-admin/tenants");
        return;
      }

      // Login con datos del tenant y rol real
      const user: AuthUser = {
        username: data.tenant.businessName,
        role: userRole,
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
            {successMessage && (
              <div className="login__success-global" role="status">
                {successMessage}
              </div>
            )}
            {error && (
              <div className="login__error-global" role="alert">
                {error}
              </div>
            )}

<div className="login__field">
              <label htmlFor="email" className="login__label">
                Usuario o Correo
              </label>
              <div className={`login__input-wrapper ${fieldErrors.email ? "login__input-wrapper--error" : ""}`}>
                <Mail size={18} className="login__input-icon" />
                <input
                  id="email"
                  className="login__input"
                  type="text"
                  placeholder="usuario o correo@email.com"
                  value={email}
                  onChange={handleEmailChange}
                  autoComplete="username"
                  disabled={isLoading || isDemoSession}
                />
              </div>
              {fieldErrors.email && (
                <span className="login__field-error">{fieldErrors.email}</span>
              )}
            </div>

            <div className="login__field">
              <label htmlFor="businessCode" className="login__label">
                Código del Negocio
              </label>
              <div className={`login__input-wrapper ${fieldErrors.businessCode ? "login__input-wrapper--error" : ""}`}>
                <Building2 size={18} className="login__input-icon" />
                <input
                  id="businessCode"
                  className="login__input"
                  type="text"
                  placeholder="ej: mi-gimnasio"
                  value={businessCode}
                  onChange={(e) => {
                    setBusinessCode(e.target.value);
                    if (error) setError("");
                  }}
                  autoComplete="off"
                  disabled={isLoading || isDemoSession}
                />
              </div>
              {fieldErrors.businessCode && (
                <span className="login__field-error">{fieldErrors.businessCode}</span>
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
                  disabled={isLoading || isDemoSession}
                />
                {!isDemoSession && (
                  <button
                    type="button"
                    className="login__toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    tabIndex={0}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
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

            {isDemoSession && (
              <div className="login__demo-exit">
                <a 
                  href="/" 
                  onClick={(e) => {
                    e.preventDefault();
                    localStorage.removeItem("demoCredentials");
                    setEmail("");
                    setPassword("");
                    setIsDemoSession(false);
                    navigate("/", { replace: true });
                  }}
                >
                  Salir del modo demo
                </a>
                {" o "}
                <Link to="/register">Crear cuenta propia</Link>
              </div>
            )}
          </form>

          <div className="login__register">
            <p>
              <a 
                href="/forgot-password"
                className="login__forgot"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </p>
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
