import {
  Activity,
  CalendarCheck,
  Award,
} from "lucide-react";
import type { ClientForm } from "../../types/client.types";

/* Stats del cliente con membresía */
interface ClientStatsProps {
  client: ClientForm;
}

const ClientStats = ({ client }: ClientStatsProps) => {
  const formatDate = (date: Date | string) => {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className="badge badge-success">Activa</span>;
      case "EXPIRED":
        return <span className="badge badge-danger">Vencida</span>;
      default:
        return <span className="badge badge-default">Sin membresía</span>;
    }
  };

  const getDaysRemaining = () => {
    if (!client.memberShipEndDate || client.memberShipStatus !== "ACTIVE") return null;
    const end = new Date(client.memberShipEndDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className="card client-stats">
      <div className="client-stats__header">
        <h3>
          <Award size={18} />
          Membresía
        </h3>
        {client.memberShip && getStatusBadge(client.memberShipStatus)}
      </div>

      <div className="client-stats__info">
        {client.memberShip ? (
          <>
            <p className="membership-name">
              <strong>{client.memberShip}</strong>
            </p>
            <div className="membership-dates">
              <div className="date-item">
                <CalendarCheck size={16} />
                <span>Inicio: {formatDate(client.memberShipStartDate)}</span>
              </div>
              <div className="date-item">
                <CalendarCheck size={16} />
                <span>Fin: {formatDate(client.memberShipEndDate)}</span>
              </div>
              {daysRemaining !== null && (
                <div className="date-item days-remaining">
                  <Activity size={16} />
                  <span>{daysRemaining} días restantes</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="no-membership">Sin membresía activa</p>
        )}
      </div>
    </div>
  );
};

export default ClientStats;
