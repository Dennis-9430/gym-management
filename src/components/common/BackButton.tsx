import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/**
 * Botón "Volver" reutilizable.
 * Por defecto navega a /dashboard. Se le pasa `to` para rutas específicas.
 */
interface BackButtonProps {
  to?: string;
}

const BackButton = ({ to = "/dashboard" }: BackButtonProps) => {
  const navigate = useNavigate();

  return (
    <button
      className="back-button"
      onClick={() => navigate(to)}
      type="button"
    >
      <ArrowLeft size={18} />
      Atrás
    </button>
  );
};

export default BackButton;
