/* Página de Términos y Condiciones */
import { Link } from "react-router-dom";
import { Dumbbell, ArrowLeft } from "lucide-react";
import "../styles/register.css";

const Terms = () => {
  return (
    <div className="register-form">
      <Link to="/register" className="register-form__back">
        <ArrowLeft size={18} /> Volver
      </Link>

      <div className="register-form__header">
        <div className="register-landing__brand" style={{ marginBottom: "1rem" }}>
          <Dumbbell size={40} />
          <h1>Gym Management</h1>
        </div>
        <h2>Términos y Condiciones</h2>
      </div>

      <div className="legal-content">
        <p><strong>Última actualización:</strong> 23 de abril de 2026</p>

        <h3>1. Aceptación de Términos</h3>
        <p>Al acceder y utilizar Gym Management, aceptas vincularte por estos términos. Si no estás de acuerdo, no utilices el servicio.</p>

        <h3>2. Descripción del Servicio</h3>
        <p>Gym Management es una plataforma SaaS de gestión para gimnasios que incluye:</p>
        <ul>
          <li>Gestión de clientes y membresías</li>
          <li>Control de inventario de productos</li>
          <li>Punto de venta (POS)</li>
          <li>Reportes financieros</li>
          <li>Gestión de empleados</li>
        </ul>

        <h3>3. Cuentas de Usuario</h3>
        <p>Eres responsable de mantener la confidencialidad de tu cuenta y contraseña. Notifica inmediatamente cualquier uso no autorizado.</p>

        <h3>4. Pago y Suscripción</h3>
        <p>Los planes Basic ($20/mes) y Premium ($30/mes) se renuevan automáticamente. Puedes cancelar en cualquier momento desde tu panel.</p>

        <h3>5. Uso Aceptable</h3>
        <p>No puedes usar el servicio para fines ilegales o no autorizados. Nos reservamos el derecho de suspender cuentas que infrinjan estos términos.</p>

        <h3>6. Limitación de Responsabilidad</h3>
        <p>El servicio se provee "tal cual". No garantizamos disponibilidad continua ni precisión de datos.</p>

        <h3>7. Contacto</h3>
        <p>Para preguntas sobre estos términos: pinzonfabricio9430@gmail.com</p>
      </div>
    </div>
  );
};

export default Terms;