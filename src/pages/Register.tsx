/* Página de registro de nuevo gimnasio (Landing) */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Dumbbell, User, Mail, Phone, Building2, Check, Loader2, Play } from "lucide-react";
import "../styles/login.css";
import "../styles/register.css";

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  demoEmail: string;
  demoPassword: string;
}

const PLANS: Plan[] = [
  {
    id: "BASIC",
    name: "Basic",
    price: 20,
    features: [
      "Gestión de Clientes",
      "Membresías",
      "Inventario de Productos",
      "Punto de Venta (POS)",
      "Registro de Asistencia"
    ],
    demoEmail: "demo-basic@gmail.com",
    demoPassword: "demoBasic123"
  },
  {
    id: "PREMIUM",
    name: "Premium",
    price: 30,
    features: [
      "Todo en Basic",
      "Gestión de Empleados (CRUD)",
      "Reportes Financieros",
      "Configuración Completa",
      "Soporte Prioritario"
    ],
    demoEmail: "demo-pro@gmail.com",
    demoPassword: "demoPro123"
  }
];

const Register = () => {
  const [step, setStep] = useState<"plans" | "form" | "success">("plans");
  const [selectedPlan, setSelectedPlan] = useState<string>("BASIC");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [fieldErrors, setFieldErrors] = useState({
    businessName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const errors = { ...fieldErrors };
    let isValid = true;

    if (!formData.businessName.trim()) {
      errors.businessName = "El nombre del negocio es requerido";
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = "El correo electrónico es requerido";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Correo electrónico inválido";
      isValid = false;
    }

    if (!formData.password.trim()) {
      errors.password = "La contraseña es requerida";
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setStep("form");
  };

  const handleDemoLogin = (planId: string) => {
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) {
      setError("Plan no encontrado");
      return;
    }
    
    // Guardar credenciales en localStorage para login
    localStorage.setItem("demoCredentials", JSON.stringify({
      email: plan.demoEmail,
      password: plan.demoPassword,
      demoPlan: planId
    }));
    
    // Redireccionar a login con parámetro
    navigate(`/?demo=true&plan=${planId}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/tenants/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          businessName: formData.businessName,
          businessPhone: formData.phone,
          plan: selectedPlan
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Error al registrar el gimnasio");
      }

      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [field]: "" }));
    }
    if (error) setError("");
  };

  if (step === "plans") {
    return (
      <div className="register-landing">
        <div className="register-landing__header">
          <div className="register-landing__brand">
            <Dumbbell size={48} strokeWidth={1.5} />
            <h1>Gym Management</h1>
            <p>El sistema de gestión ideal para tu gimnasio</p>
          </div>
        </div>

        <div className="register-landing__content">
          <h2 className="register-landing__title">Elige tu plan</h2>
          <p className="register-landing__subtitle">
            Comienza hoy. Sin compromiso. Cancela cuando quieras.
          </p>

          <div className="register-landing__plans">
            {PLANS.map((plan) => (
              <div 
                key={plan.id} 
                className={`register-landing__plan ${selectedPlan === plan.id ? "register-landing__plan--selected" : ""}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.id === "PREMIUM" && (
                  <span className="register-landing__badge">Más Popular</span>
                )}
                <h3>{plan.name}</h3>
                <div className="register-landing__price">
                  <span className="register-landing__currency">$</span>
                  <span className="register-landing__amount">{plan.price}</span>
                  <span className="register-landing__period">/mes</span>
                </div>
                <ul className="register-landing__features">
                  {plan.features.map((feature, i) => (
                    <li key={i}>
                      <Check size={16} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="register-landing__actions">
                  <button
                    type="button"
                    className="register-landing__demo"
                    onClick={() => handleDemoLogin(plan.id)}
                    disabled={isLoading}
                  >
                    <Play size={16} />
                    Probar Gratis
                  </button>
                  <button
                    type="button"
                    className="register-landing__select"
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    Seleccionar {plan.name}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="register-landing__footer">
            <p>
              ¿Ya tienes cuenta? <Link to="/">Iniciar sesión</Link>
            </p>
            <p className="register-form__terms">
              Al registrarte, aceptas nuestros{" "}
              <a href="/terms" target="_blank">Términos y Condiciones</a> y{" "}
              <a href="/privacy" target="_blank">Política de Privacidad</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="register-success">
        <div className="register-success__card">
          <div className="register-success__icon">
            <Check size={48} />
          </div>
          <h2>¡Registro exitoso!</h2>
          <p>
            Tu gimnasio <strong>{formData.businessName}</strong> ha sido registrado.
          </p>
          <p className="register-success__note">
            Te hemos enviado las credenciales a <strong>{formData.email}</strong>
          </p>
          <p className="register-success__info">
            Por favor, confirma tu correo electrónico. Mientras tanto, 
            puedes usar las credenciales temporales para acceder al sistema.
          </p>
          <button
            className="register-success__button"
            onClick={() => navigate("/")}
          >
            Ir a Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  const selectedPlanData = PLANS.find(p => p.id === selectedPlan);

  return (
    <div className="register-form">
      <button 
        className="register-form__back"
        onClick={() => setStep("plans")}
      >
        ← Volver a planes
      </button>

      <div className="register-form__header">
        <h2>Completa tu registro</h2>
        <p>Plan seleccionado: <strong>{selectedPlanData?.name}</strong> - ${selectedPlanData?.price}/mes</p>
      </div>

      <form className="register-form__form" onSubmit={handleSubmit}>
        {error && (
          <div className="register-form__error" role="alert">
            {error}
          </div>
        )}

        <div className="register-form__field">
          <label>Nombre del Negocio</label>
          <div className={`register-form__input-wrap ${fieldErrors.businessName ? "register-form__input-wrap--error" : ""}`}>
            <Building2 size={18} />
            <input
              type="text"
              placeholder="Nombre de tu gimnasio"
              value={formData.businessName}
              onChange={(e) => handleChange("businessName", e.target.value)}
            />
          </div>
          {fieldErrors.businessName && (
            <span className="register-form__field-error">{fieldErrors.businessName}</span>
          )}
        </div>

        <div className="register-form__field">
          <label>Correo Electrónico</label>
          <div className={`register-form__input-wrap ${fieldErrors.email ? "register-form__input-wrap--error" : ""}`}>
            <Mail size={18} />
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
          {fieldErrors.email && (
            <span className="register-form__field-error">{fieldErrors.email}</span>
          )}
        </div>

        <div className="register-form__field">
          <label>Teléfono (opcional)</label>
          <div className="register-form__input-wrap">
            <Phone size={18} />
            <input
              type="tel"
              placeholder="+51 999 999 999"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>
        </div>

        <div className="register-form__field">
          <label>Contraseña</label>
          <div className={`register-form__input-wrap ${fieldErrors.password ? "register-form__input-wrap--error" : ""}`}>
            <User size={18} />
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />
          </div>
          {fieldErrors.password && (
            <span className="register-form__field-error">{fieldErrors.password}</span>
          )}
        </div>

        <div className="register-form__field">
          <label>Confirmar Contraseña</label>
          <div className={`register-form__input-wrap ${fieldErrors.confirmPassword ? "register-form__input-wrap--error" : ""}`}>
            <User size={18} />
            <input
              type="password"
              placeholder="Repite tu contraseña"
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
            />
          </div>
          {fieldErrors.confirmPassword && (
            <span className="register-form__field-error">{fieldErrors.confirmPassword}</span>
          )}
        </div>

        <button
          type="submit"
          className="register-form__button"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="register-form__spinner" />
              Registrando...
            </>
          ) : (
            "Completar Registro"
          )}
        </button>
      </form>

      <div className="register-form__footer">
        <p>
          ¿Ya tienes cuenta? <Link to="/">Iniciar sesión</Link>
        </p>
        <p className="register-form__terms">
          Al registrarte, aceptas nuestros{" "}
          <a href="/terms" target="_blank">Términos y Condiciones</a> y{" "}
          <a href="/privacy" target="_blank">Política de Privacidad</a>
        </p>
      </div>
    </div>
  );
};

export default Register;