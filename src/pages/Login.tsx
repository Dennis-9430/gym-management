import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoginService } from "../services/auth.services";
import type { AuthUser } from "../types/user.types";
import "../styles/login.css";

const Login = () => {
  const [username, setUser] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user: AuthUser | null = LoginService(username, password);

    if (!user) {
      alert("Credenciales incorrectas");
      return;
    }
    login(user);
    navigate("/dashboard");
  };

  const inputUser = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser(e.target.value);
  };
  const inputPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };
  return (
    <>
      <div className="login">
        <div className="login__container">
          <div className="login__card">
            <h1 className="login__title">Gym Management</h1>
            <h4 className="login__subtitle"> Login </h4>
            <form className="login__form" onSubmit={handleSubmit}>
              <div className="login__field">
                <input
                  className="login__input"
                  type="text"
                  placeholder="Ingrese usuario"
                  value={username}
                  onChange={inputUser}
                />
              </div>
              <div className="login__field">
                <input
                  className="login__input"
                  type="password"
                  placeholder="ingrese contraseña"
                  value={password}
                  onChange={inputPassword}
                />
              </div>

              <button className="login__button" type="submit">
                Iniciar Sesión
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
export default Login;
