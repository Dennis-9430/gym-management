/* Página de Política de Privacidad */
import { Link } from "react-router-dom";
import { Dumbbell, ArrowLeft } from "lucide-react";
import "../styles/register.css";

const Privacy = () => {
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
        <h2>Política de Privacidad</h2>
      </div>

      <div className="legal-content">
        <p><strong>Última actualización:</strong> 23 de abril de 2026</p>

        <h3>1. Información que Recopilamos</h3>
        <p>Recopilamos información que nos proporcionas al registrarte:</p>
        <ul>
          <li>Nombre del negocio</li>
          <li>Correo electrónico</li>
          <li>Teléfono</li>
          <li>Datos de empleados y clientes que agregues al sistema</li>
        </ul>

        <h3>2. Uso de la Información</h3>
        <p>Usamos tu información para:</p>
        <ul>
          <li>Proporcionarte el servicio solicitado</li>
          <li>Procesar pagos</li>
          <li>Enviar notificaciones relacionadas con tu suscripción</li>
          <li>Mejorar nuestros servicios</li>
        </ul>

        <h3>3. Almacenamiento y Seguridad</h3>
        <p>Tus datos se almacenan en servidores seguros. Implementamos medidas técnicas y organizativas para proteger tu información.</p>

        <h3>4. Compartición de Información</h3>
        <p>No vendemos tu información personal. Sharing only occurs:</p>
        <ul>
          <li>Con tu consentimiento explícito</li>
          <li>Para cumplir requisitos legales</li>
          <li>Con proveedores de servicios (hospedaje, pago) que actúan en nuestro nombre</li>
        </ul>

        <h3>5. Retención de Datos</h3>
        <p>Conservamos tu información mientras tu cuenta esté activa o según sea necesario para proporcionar servicios.</p>

        <h3>6. Tus Derechos</h3>
        <p>Tienes derecho a:</p>
        <ul>
          <li>Acceder a tus datos personales</li>
          <li>Rectificar datos inexactos</li>
          <li>Solicitar eliminación de tus datos</li>
          <li>Exportar tus datos</li>
        </ul>

        <h3>7. Niños</h3>
        <p>Nuestro servicio no está dirigido a menores de 13 años.</p>

        <h3>8. Cambios a esta Política</h3>
        <p>Podemos modificar esta política. Te notificaremos de cambios significativos.</p>

        <h3>9. Contacto</h3>
        <p>Para preguntas sobre privacidad: pinzonfabricio9430@gmail.com</p>
      </div>
    </div>
  );
};

export default Privacy;