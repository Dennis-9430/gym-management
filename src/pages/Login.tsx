import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/index.ts";
import { LoginService } from "../services/auth.services";
import type { AuthUser } from "../types/user.types";
import { User, Lock, Eye, EyeOff, Dumbbell, Loader2 } from "lucide-react";
import "../styles/login.css";

/* Página de inicio de sesión */
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ username: "", password: "" });
  
  const { login } = useAuth();
  const navigate = useNavigate();

  /* Valida que los campos no estén vacíos */
  const validateForm = (): boolean => {
    const errors = { username: "", password: "" };
    let isValid = true;

    if (!username.trim()) {
      errors.username = "El usuario es requerido";
      isValid = false;
    }

    if (!password.trim()) {
      errors.password = "La contraseña es requerida";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  /* Envía credenciales al servicio de auth */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const user: AuthUser | null = LoginService(username, password);

    setIsLoading(false);

    if (!user) {
      setError("Credenciales incorrectas. Verifica tu usuario y contraseña.");
      return;
    }

    login(user);
    navigate("/dashboard");
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (fieldErrors.username) {
      setFieldErrors((prev) => ({ ...prev, username: "" }));
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
              <label htmlFor="username" className="login__label">
                Usuario
              </label>
              <div className={`login__input-wrapper ${fieldErrors.username ? "login__input-wrapper--error" : ""}`}>
                <User size={18} className="login__input-icon" />
                <input
                  id="username"
                  className="login__input"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={handleUsernameChange}
                  autoComplete="username"
                  disabled={isLoading}
                />
              </div>
              {fieldErrors.username && (
                <span className="login__field-error">{fieldErrors.username}</span>
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

          <div className="login__footer">
            <p>© 2024 Gym Management</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
