/* Página de registro de nuevo gimnasio (Landing) —
   Diseño SaaS premium con estructura: hero → métricas → pricing → FAQ → footer */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Dumbbell,
  User,
  Mail,
  Phone,
  Building2,
  Tag,
  Check,
  Loader2,
  Play,
  Eye,
  EyeOff,
  Star,
  HelpCircle,
} from "lucide-react";
import { buildUrl } from "../services/api";
import "../styles/login.css";
import "../styles/register.css";
import "../styles/register-form.css";

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  exclusiveFeatures?: string[];
  demoEmail: string;
  demoPassword: string;
}

const PLANS: Plan[] = [
  {
    id: "BASIC",
    name: "Basic",
    price: 20,
    features: [
      "Clientes y Membresías",
      "Inventario de Productos",
      "Punto de Venta (POS)",
    ],
    demoEmail: "demo-basic@gmail.com",
    demoPassword: "demoBasic123",
  },
  {
    id: "PREMIUM",
    name: "Premium",
    price: 30,
    features: [
      "Todo lo de Basic",
      "Gestión de Empleados",
      "Reportes Financieros",
      "Configuración personalizada",
      "Soporte Prioritario",
    ],
    exclusiveFeatures: ["Empleados", "Reportes", "Soporte Prioritario"],
    demoEmail: "demo-pro@gmail.com",
    demoPassword: "demoPro123",
  },
];

/** Convierte texto a slug URL-friendly */
const slugify = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[-\s]+/g, "-")
    .replace(/^-+|-+$/g, "");

const Register = () => {
  const [step, setStep] = useState<"plans" | "form">("plans");
  const [selectedPlan, setSelectedPlan] = useState<string>("BASIC");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    businessCode: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    ownerFirstName: "",
    ownerLastName: "",
  });
  const [fieldErrors, setFieldErrors] = useState({
    businessName: "",
    businessCode: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    ownerFirstName: "",
    ownerLastName: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "TRANSFER" | null>(null);
  const [showGateway, setShowGateway] = useState(false);
  const [gatewayLoading, setGatewayLoading] = useState(false);
  const [gatewayError, setGatewayError] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [transferReference, setTransferReference] = useState("");

  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const errors = { ...fieldErrors };
    let isValid = true;

    if (!formData.businessName.trim()) {
      errors.businessName = "El nombre del negocio es requerido";
      isValid = false;
    }

    if (!formData.ownerFirstName.trim()) {
      errors.ownerFirstName = "Tu nombre es requerido";
      isValid = false;
    }

    if (!formData.ownerLastName.trim()) {
      errors.ownerLastName = "Tu apellido es requerido";
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
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) {
      setError("Plan no encontrado");
      return;
    }

    localStorage.setItem(
      "demoCredentials",
      JSON.stringify({
        email: plan.demoEmail,
        password: plan.demoPassword,
        demoPlan: planId,
      }),
    );

    navigate(`/?demo=true&plan=${planId}`);
  };

  const submitRegistration = async (cardToken?: string) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(buildUrl("/api/tenants/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          businessName: formData.businessName,
          businessCode: formData.businessCode || undefined,
          businessPhone: formData.phone,
          plan: selectedPlan,
          ownerFirstName: formData.ownerFirstName,
          ownerLastName: formData.ownerLastName,
          paymentMethod,
          ...(cardToken && { cardToken }),
          ...(transferReference && { transferReference }),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.detail ||
            `Error ${response.status}: No se pudo registrar el gimnasio`,
        );
      }

      const registeredTenant = await response.json();

      const params = new URLSearchParams();
      params.set(
        "message",
        "Gimnasio registrado exitosamente. Por favor, inicia sesión.",
      );
      if (registeredTenant.tenantId) {
        params.set("tenantId", registeredTenant.tenantId);
      }
      if (registeredTenant.businessCode) {
        params.set("code", registeredTenant.businessCode);
      }

      navigate(`/?${params.toString()}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error de conexión con el servidor";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;
    if (!paymentMethod) { setError("Seleccioná un método de pago"); return; }
    if (paymentMethod === "CARD") { setShowGateway(true); return; }
    await submitRegistration();
  };

  const handleGatewayPay = async () => {
    setGatewayError("");

    const cleanCard = cardNumber.replace(/\s/g, "");
    if (cleanCard.length < 13 || cleanCard.length > 19) {
      setGatewayError("Número de tarjeta inválido");
      return;
    }
    if (!cardExpiry.match(/^\d{2}\/\d{2}$/)) {
      setGatewayError("Fecha de vencimiento inválida");
      return;
    }
    if (!cardCvv.match(/^\d{3,4}$/)) {
      setGatewayError("CVV inválido");
      return;
    }
    if (!cardName.trim()) {
      setGatewayError("El nombre del titular es requerido");
      return;
    }

    setGatewayLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1800));

    const token = `tok_sim_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;

    setGatewayLoading(false);
    setShowGateway(false);

    await submitRegistration(token);
  };

  const handleCardNumberInput = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
  };

  const handleCardExpiryInput = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) {
      setCardExpiry(digits);
    } else {
      setCardExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    }
  };

  const handleCardCvvInput = (value: string) => {
    setCardCvv(value.replace(/\D/g, "").slice(0, 4));
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "businessName") {
        updated.businessCode = slugify(value) || "";
      }
      return updated;
    });
    if (fieldErrors[field as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (error) setError("");
  };

  if (step === "plans") {
    return (
      <div className="register-landing">
        <div className="register-landing__bg-glow" />
        <div className="register-landing__bg-noise" />

        <div className="register-landing__hero">
          <div className="register-landing__brand">
            <div className="register-landing__brand-icon">
              <Dumbbell size={32} strokeWidth={1.5} />
            </div>
            <h1 className="register-landing__headline">
              Gestioná tu gimnasio
              <br />
              <span className="register-landing__headline-accent">
                como un negocio moderno
              </span>
            </h1>
            <p className="register-landing__subheadline">
              Controlá clientes, membresías, pagos y más desde un solo lugar.
            </p>
          </div>
        </div>

        <div className="register-landing__content">
          <h2 className="register-landing__title">Elegí tu plan</h2>
          <p className="register-landing__subtitle">
            Empezá hoy. Sin compromiso. Cancelá cuando quieras.
          </p>

          <div className="register-landing__plans">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`register-landing__plan ${plan.id === "PREMIUM" ? "register-landing__plan--premium" : "register-landing__plan--basic"} ${selectedPlan === plan.id ? "register-landing__plan--selected" : ""}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.id === "PREMIUM" && (
                  <span className="register-landing__badge">Más Popular</span>
                )}
                <h3 className="register-landing__plan-name">{plan.name}</h3>
                <div className="register-landing__price">
                  <span className="register-landing__currency">$</span>
                  <span className="register-landing__amount">{plan.price}</span>
                  <span className="register-landing__period">/mes</span>
                </div>
                <ul className="register-landing__features">
                  {plan.features.map((feature, i) => {
                    const isExclusive = plan.exclusiveFeatures?.some(
                      (ex) =>
                        feature.startsWith("Todo") || feature.includes(ex),
                    );
                    return (
                      <li
                        key={i}
                        className={`register-landing__feature ${isExclusive ? "register-landing__feature--exclusive" : ""} ${feature === "Todo lo de Basic" ? "register-landing__feature--muted" : ""}`}
                      >
                        {isExclusive ? (
                          <Star
                            size={15}
                            className="register-landing__feature-star"
                          />
                        ) : (
                          <Check
                            size={15}
                            className="register-landing__feature-check"
                          />
                        )}
                        <span>{feature}</span>
                      </li>
                    );
                  })}
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
                    className={`register-landing__select ${plan.id === "PREMIUM" ? "register-landing__select--premium" : ""}`}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    Seleccionar {plan.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="register-landing__faq">
          <h3 className="register-landing__faq-title">Preguntas frecuentes</h3>
          <div className="register-landing__faq-items">
            <div className="register-landing__faq-item">
              <HelpCircle size={16} className="register-landing__faq-icon" />
              <div>
                <strong>¿Puedo cancelar cuando quiera?</strong>
                <p>
                  Sí, sin multas ni compromisos. Cancelás y seguís hasta fin de
                  mes.
                </p>
              </div>
            </div>
            <div className="register-landing__faq-item">
              <HelpCircle size={16} className="register-landing__faq-icon" />
              <div>
                <strong>¿Puedo cambiar de plan después?</strong>
                <p>
                  Obvio. Actualizás o downgradeás cuando quieras desde
                  configuración.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="register-landing__footer">
          <div className="register-landing__footer-links">
            <Link to="/terms">Términos</Link>
            <span className="register-landing__footer-dot">·</span>
            <Link to="/privacy">Privacidad</Link>
            <span className="register-landing__footer-dot">·</span>
            <a href="mailto:soporte@gymmanagement.com">Soporte</a>
          </div>
          <p className="register-landing__footer-copy">
            © 2024 Gym Management. Todos los derechos reservados.
          </p>
          <p className="register-landing__footer-login">
            ¿Ya tenés cuenta? <Link to="/">Iniciar sesión</Link>
          </p>
        </div>
      </div>
    );
  }

  const selectedPlanData = PLANS.find((p) => p.id === selectedPlan);
  const price = selectedPlanData?.price ?? 0;

  return (
    <div className="register-form">
      <button className="register-form__back" onClick={() => setStep("plans")}>
        ← Volver a planes
      </button>

      <div className="register-form__header">
        <h2>Completa tu registro</h2>
        <div className="register-form__plan-badge">
          <span className="register-form__plan-badge-name">{selectedPlan}</span>
          <span className="register-form__plan-badge-divider">·</span>
          <span className="register-form__plan-badge-price">${price}/mes</span>
        </div>
      </div>

      <form className="register-form__form" onSubmit={handleSubmit}>
        {error && (
          <div className="register-form__error" role="alert">
            {error}
          </div>
        )}

        <div className="register-form__layout">
          <div className="register-form__main">
            <div className="register-form__fields-grid">
              <div className="register-form__field register-form__field--full">
                <label>Nombre del Negocio</label>
                <div
                  className={`register-form__input-wrap ${fieldErrors.businessName ? "register-form__input-wrap--error" : ""}`}
                >
                  <Building2 size={18} />
                  <input
                    type="text"
                    placeholder="Nombre de tu negocio"
                    value={formData.businessName}
                    onChange={(e) => handleChange("businessName", e.target.value)}
                    maxLength={100}
                    autoComplete="organization"
                  />
                </div>
                {fieldErrors.businessName && (
                  <span className="register-form__field-error">
                    {fieldErrors.businessName}
                  </span>
                )}
              </div>

              <div className="register-form__field register-form__field--full">
                <label>
                  Código del Negocio
                  <span
                    style={{
                      fontWeight: "normal",
                      color: "var(--color-text-light)",
                      fontSize: "0.75em",
                      marginLeft: 6,
                    }}
                  >
                    (auto-generado)
                  </span>
                </label>
                <div
                  className={`register-form__input-wrap ${fieldErrors.businessCode ? "register-form__input-wrap--error" : ""}`}
                >
                  <Tag size={18} />
                  <input
                    type="text"
                    placeholder="código-auto-generado"
                    value={formData.businessCode}
                    readOnly
                    className="register-form__input register-form__input--readonly"
                    tabIndex={-1}
                  />
                </div>
                {fieldErrors.businessCode && (
                  <span className="register-form__field-error">
                    {fieldErrors.businessCode}
                  </span>
                )}
              </div>

              <div className="register-form__field register-form__field--full">
                <label>Correo Electrónico</label>
                <div
                  className={`register-form__input-wrap ${fieldErrors.email ? "register-form__input-wrap--error" : ""}`}
                >
                  <Mail size={18} />
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    maxLength={254}
                    autoComplete="email"
                  />
                </div>
                {fieldErrors.email && (
                  <span className="register-form__field-error">
                    {fieldErrors.email}
                  </span>
                )}
              </div>

              <div className="register-form__field register-form__field--full">
                <label>Teléfono (opcional)</label>
                <div className="register-form__input-wrap">
                  <Phone size={18} />
                  <input
                    type="tel"
                    placeholder="+51 999 999 999"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    maxLength={20}
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="register-form__field">
                <label>Nombres</label>
                <div
                  className={`register-form__input-wrap ${fieldErrors.ownerFirstName ? "register-form__input-wrap--error" : ""}`}
                >
                  <User size={18} />
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={formData.ownerFirstName}
                    onChange={(e) => handleChange("ownerFirstName", e.target.value)}
                    maxLength={50}
                    autoComplete="given-name"
                  />
                </div>
                {fieldErrors.ownerFirstName && (
                  <span className="register-form__field-error">
                    {fieldErrors.ownerFirstName}
                  </span>
                )}
              </div>

              <div className="register-form__field">
                <label>Apellidos</label>
                <div
                  className={`register-form__input-wrap ${fieldErrors.ownerLastName ? "register-form__input-wrap--error" : ""}`}
                >
                  <User size={18} />
                  <input
                    type="text"
                    placeholder="Apellido"
                    value={formData.ownerLastName}
                    onChange={(e) => handleChange("ownerLastName", e.target.value)}
                    maxLength={50}
                    autoComplete="family-name"
                  />
                </div>
                {fieldErrors.ownerLastName && (
                  <span className="register-form__field-error">
                    {fieldErrors.ownerLastName}
                  </span>
                )}
              </div>

              <div className="register-form__field">
                <label>Contraseña</label>
                <div
                  className={`register-form__input-wrap ${fieldErrors.password ? "register-form__input-wrap--error" : ""}`}
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingrese su contraseña"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    maxLength={32}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="register-form__password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <span className="register-form__field-error">
                    {fieldErrors.password}
                  </span>
                )}
              </div>

              <div className="register-form__field">
                <label>Confirmar Contraseña</label>
                <div
                  className={`register-form__input-wrap ${fieldErrors.confirmPassword ? "register-form__input-wrap--error" : ""}`}
                >
                  <User size={18} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Ingrese su contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleChange("confirmPassword", e.target.value)
                    }
                    maxLength={32}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="register-form__password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <span className="register-form__field-error">
                    {fieldErrors.confirmPassword}
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="register-form__button register-form__button--full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="register-form__spinner" />
                  Procesando...
                </>
              ) : (
                "Completar registro"
              )}
            </button>

            <div className="register-form__trust">
              <div className="register-form__trust-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span>Pago seguro</span>
              </div>
              <div className="register-form__trust-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span>SSL 256-bit</span>
              </div>
              <div className="register-form__trust-item">
                <Check size={14} />
                <span>Cancelación gratis</span>
              </div>
              <div className="register-form__trust-item">
                <Check size={14} />
                <span>Varios métodos</span>
              </div>
            </div>
          </div>

          <aside className="register-form__aside">
            <div className="register-payment__section">
              <h3 className="register-payment__section-title">Método de pago</h3>

              <div className="register-payment__methods">
                <button
                  type="button"
                  className={`register-payment__method ${paymentMethod === "CARD" ? "register-payment__method--active" : ""}`}
                  onClick={() => setPaymentMethod("CARD")}
                >
                  <span className="register-payment__method-icon">💳</span>
                  <span className="register-payment__method-text">
                    <span className="register-payment__method-label">Tarjeta débito/crédito</span>
                    <span className="register-payment__method-sub">PayPhone</span>
                  </span>
                </button>
                <button
                  type="button"
                  className={`register-payment__method ${paymentMethod === "TRANSFER" ? "register-payment__method--active" : ""}`}
                  onClick={() => setPaymentMethod("TRANSFER")}
                >
                  <span className="register-payment__method-icon">🏦</span>
                  <span className="register-payment__method-text">
                    <span className="register-payment__method-label">Transferencia bancaria</span>
                    <span className="register-payment__method-sub">CBU / Alias</span>
                  </span>
                </button>
              </div>

              {paymentMethod === "CARD" && (
                <div className="register-payment__card-note">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  <span>Al continuar, abriremos una pasarela de pago segura para ingresar los datos de tu tarjeta.</span>
                </div>
              )}

              {paymentMethod === "TRANSFER" && (
                <div className="register-payment__transfer-form">
                  <div className="register-payment__bank-info">
                    <h4>Datos bancarios</h4>
                    <div className="register-payment__bank-detail"><span className="register-payment__bank-label">Banco:</span><span>Banco de Prueba S.A.</span></div>
                    <div className="register-payment__bank-detail"><span className="register-payment__bank-label">Titular:</span><span>Gym Management S.A.S.</span></div>
                    <div className="register-payment__bank-detail"><span className="register-payment__bank-label">CBU:</span><span className="register-payment__bank-mono">2850590940090428133846</span></div>
                    <div className="register-payment__bank-detail"><span className="register-payment__bank-label">Alias:</span><span className="register-payment__bank-mono">GYM.MANAGEMENT.PAGO</span></div>
                    <div className="register-payment__bank-detail"><span className="register-payment__bank-label">Monto:</span><strong>${price.toFixed(2)}</strong></div>
                  </div>
                  <div className="register-payment__transfer-field">
                    <label>Referencia (opcional)</label>
                    <input type="text" placeholder="Nro de operación o referencia" value={transferReference} onChange={(e) => setTransferReference(e.target.value)} maxLength={100} />
                  </div>
                  <div className="register-payment__transfer-note">
                    <p>Una vez realizada la transferencia, envianos el comprobante por:</p>
                    <div className="register-payment__contact-links">
                      <span>📧 pinzonfabricio9430@gmail.com</span>
                      <span>📱 WhatsApp: +54 9 11 1234-5678</span>
                    </div>
                    <p className="register-payment__transfer-advice">Te avisaremos cuando el pago sea aprobado.</p>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </form>

      <div className="register-form__footer">
        <p>
          ¿Ya tienes cuenta? <Link to="/">Iniciar sesión</Link>
        </p>
        <p className="register-form__terms">
          Al registrarte, aceptas nuestros{" "}
          <a href="/terms" target="_blank">
            Términos y Condiciones
          </a>{" "}
          y{" "}
          <a href="/privacy" target="_blank">
            Política de Privacidad
          </a>
        </p>
      </div>

      {showGateway && selectedPlanData && (
        <div className="register-gateway">
          <div className="register-gateway__backdrop" onClick={() => { if (!gatewayLoading) setShowGateway(false); }} />
          <div className="register-gateway__modal">
            <div className="register-gateway__form">
              <div className="register-gateway__header">
                <button type="button" className="register-gateway__close" onClick={() => { if (!gatewayLoading) setShowGateway(false); }} disabled={gatewayLoading}>← Volver</button>
                <div className="register-gateway__brand">
                  <Dumbbell size={20} strokeWidth={1.5} />
                  <span>Pago seguro</span>
                </div>
              </div>
              <div className="register-gateway__body">
                <h3 className="register-gateway__title">Completá el pago</h3>
                <p className="register-gateway__subtitle">Tus datos están protegidos con cifrado SSL de 256 bits</p>

                {gatewayError && <div className="register-gateway__error" role="alert">{gatewayError}</div>}

                <div className="register-gateway__card">
                  <div className="register-gateway__card-field">
                    <label>Número de tarjeta</label>
                    <input type="text" placeholder="1234 5678 9012 3456" value={cardNumber} onChange={(e) => handleCardNumberInput(e.target.value)} maxLength={19} autoComplete="cc-number" disabled={gatewayLoading} />
                  </div>
                  <div className="register-gateway__card-row">
                    <div className="register-gateway__card-field">
                      <label>Vencimiento</label>
                      <input type="text" placeholder="MM/AA" value={cardExpiry} onChange={(e) => handleCardExpiryInput(e.target.value)} maxLength={5} autoComplete="cc-exp" disabled={gatewayLoading} />
                    </div>
                    <div className="register-gateway__card-field">
                      <label>CVV</label>
                      <input type="text" placeholder="123" value={cardCvv} onChange={(e) => handleCardCvvInput(e.target.value)} maxLength={4} autoComplete="cc-csc" disabled={gatewayLoading} />
                    </div>
                  </div>
                  <div className="register-gateway__card-field">
                    <label>Titular de la tarjeta</label>
                    <input type="text" placeholder="Como figura en la tarjeta" value={cardName} onChange={(e) => setCardName(e.target.value)} maxLength={100} autoComplete="cc-name" disabled={gatewayLoading} />
                  </div>
                </div>

                <div className="register-gateway__unavailable">
                  <span>🚧 Pago con tarjeta no disponible — próximamente</span>
                  <span className="register-gateway__unavailable-hint">Seleccioná "Transferencia bancaria" como método de pago</span>
                </div>

                <button type="button" className="register-gateway__pay" disabled>
                  <Loader2 size={20} className="register-form__spinner" />
                  Próximamente
                </button>

                <div className="register-gateway__secure">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <span>Pago 100% seguro · SSL 256-bit</span>
                </div>
              </div>
              <div className="register-gateway__cards">
                <span>Visa</span><span>Mastercard</span><span>Diners</span><span>Discover</span>
              </div>
            </div>
            <div className="register-gateway__summary">
              <div className="register-gateway__summary-inner">
                <h4>Resumen del pedido</h4>
                <div className="register-gateway__summary-plan">
                  <div className="register-gateway__summary-plan-name">Plan {selectedPlan}</div>
                  <div className="register-gateway__summary-plan-features">
                    {selectedPlanData.features.slice(0, 3).map((f, i) => (
                      <div key={i} className="register-gateway__summary-feature">
                        <Check size={12} />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="register-gateway__summary-divider" />
                <div className="register-gateway__summary-row"><span>Subtotal</span><span>${price.toFixed(2)}</span></div>
                <div className="register-gateway__summary-row"><span>IVA</span><span>$0.00</span></div>
                <div className="register-gateway__summary-row register-gateway__summary-row--total"><span>Total</span><strong>${price.toFixed(2)}</strong></div>
                <div className="register-gateway__summary-divider" />
                <div className="register-gateway__summary-business"><Building2 size={14} /><span>{formData.businessName}</span></div>
                <div className="register-gateway__summary-business"><Mail size={14} /><span>{formData.email}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
