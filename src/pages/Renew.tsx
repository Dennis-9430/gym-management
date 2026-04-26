/* Página de renovación de suscripción */
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Dumbbell, RefreshCw, Check, Loader2, AlertCircle } from "lucide-react";
import "../styles/register.css";

interface TenantInfo {
  tenantId: string;
  email: string;
  businessName: string;
  plan: string;
  subscriptionStatus: string;
  subscriptionEndDate: string | null;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: "BASIC",
    name: "Basic",
    price: 20,
    features: ["Gestión de Clientes", "Membresías", "Inventario", "POS", "Asistencia"]
  },
  {
    id: "PREMIUM",
    name: "Premium",
    price: 30,
    features: ["Todo en Basic", "Empleados (CRUD)", "Reportes", "Configuración"]
  }
];

const Renew = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tenantId = searchParams.get("tenant") || "";
  
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [isRenewing, setIsRenewing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!tenantId) {
      setError("Token de renovación inválido");
      setIsLoading(false);
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

    const fetchTenant = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/tenants/me?tenantId=${tenantId}`);
        
        if (!response.ok) {
          throw new Error("Gimnasio no encontrado");
        }
        
        const data = await response.json();
        setTenant(data);
        setSelectedPlan(data.plan);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenant();
  }, [tenantId]);

  const handleRenew = async () => {
    if (!selectedPlan) return;
    
    setIsRenewing(true);
    setError("");

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(`${apiUrl}/api/tenants/renew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, plan: selectedPlan })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Error al renovar");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setIsRenewing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="register-success">
        <div className="register-success__card">
          <Loader2 size={48} className="register-form__spinner" />
          <p>Cargando información...</p>
        </div>
      </div>
    );
  }

  if (error && !tenant) {
    return (
      <div className="register-success">
        <div className="register-success__card">
          <AlertCircle size={48} />
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/">Ir al inicio</Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="register-success">
        <div className="register-success__card">
          <div className="register-success__icon">
            <Check size={48} />
          </div>
          <h2>¡Renovación Exitosa!</h2>
          <p>Tu suscripción ha sido renovada exitosamente.</p>
          <p className="register-success__info">
            Gracias por confiar en Gym Management.
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

  return (
    <div className="register-form">
      <div className="register-form__header">
        <div className="register-landing__brand" style={{ marginBottom: "1rem" }}>
          <Dumbbell size={40} />
          <h1>Gym Management</h1>
        </div>
        <h2>Renovar Suscripción</h2>
        <p>
          {tenant?.businessName} ({tenant?.email})
        </p>
      </div>

      {tenant?.subscriptionStatus === "EXPIRED" && (
        <div className="register-form__error" style={{ marginBottom: "1rem" }}>
          Tu suscripción ha vencido. Renueva para continuar usando el sistema.
        </div>
      )}

      {error && (
        <div className="register-form__error" role="alert" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <div className="register-landing__plans" style={{ marginBottom: "1.5rem" }}>
        {PLANS.map((plan) => (
          <div 
            key={plan.id}
            className={`register-landing__plan ${selectedPlan === plan.id ? "register-landing__plan--selected" : ""}`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            <h3>{plan.name}</h3>
            <div className="register-landing__price">
              <span className="register-landing__currency">$</span>
              <span className="register-landing__amount">{plan.price}</span>
              <span className="register-landing__period">/mes</span>
            </div>
            {selectedPlan === plan.id && (
              <button
                type="button"
                className="register-landing__select"
                disabled={isRenewing}
              >
                {isRenewing ? (
                  <>
                    <Loader2 size={20} className="register-form__spinner" />
                    Procesando...
                  </>
                ) : (
                  "Seleccionado"
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        className="register-form__button"
        onClick={handleRenew}
        disabled={isRenewing || !selectedPlan}
      >
        {isRenewing ? (
          <>
            <Loader2 size={20} className="register-form__spinner" />
            Procesando renovación...
          </>
        ) : (
          <>
            <RefreshCw size={20} />
            Renovar Suscripción
          </>
        )}
      </button>

      <div className="register-form__footer">
        <p>
          <Link to="/">Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
};

export default Renew;