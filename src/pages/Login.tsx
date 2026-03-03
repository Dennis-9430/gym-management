import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoginService } from "../services/auth.services";
import type { User } from "../types/user.types";

const Login = () => {
  const [username, setUser] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user: User | null = LoginService(username, password);

    if (!user) {
      alert("Credenciales incorrectas");
      return;
    }
    login(user);

    if (user.role === "ADMIN") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  const inputUser = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser(e.target.value);
  };
  const inputPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };
  return (
    <>
      <h1>Gym Management</h1>
      <div>
        <h2> Login Gym Management</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Ingrese usuario"
            value={username}
            onChange={inputUser}
          />
          <input
            type="password"
            placeholder="ingrese contraseña"
            value={password}
            onChange={inputPassword}
          />
          <button type="submit"> Ingresar</button>
        </form>
      </div>
    </>
  );
};
export default Login;
