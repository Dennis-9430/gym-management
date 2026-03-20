import { useMemo } from "react";
import {
  Activity,
  CalendarCheck,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Award,
} from "lucide-react";
import type { ClientForm } from "../../types/client.types";

interface ClientStatsProps {
  client: ClientForm;
}

interface ClientStats {
  totalAttendances: number;
  lastAttendance: string | null;
  averageWeekly: number;
  totalSpent: number;
  totalPurchases: number;
}

const generateMockStats = (clientId: number): ClientStats => {
  const seed = clientId * 7;
  return {
    totalAttendances: 10 + (seed % 50),
    lastAttendance: seed % 3 === 0 ? null : new Date(Date.now() - (seed % 7) * 24 * 60 * 60 * 1000).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    averageWeekly: Number((2 + (seed % 10) * 0.3).toFixed(1)),
    totalSpent: Number((50 + seed * 5.5).toFixed(2)),
    totalPurchases: 3 + (seed % 15),
  };
};

const ClientStats = ({ client }: ClientStatsProps) => {
  const stats = useMemo(() => generateMockStats(client.id), [client.id]);

  const membershipHistory = useMemo(() => {
    const history = [];
    const baseDate = new Date(client.memberShipStartDate);
    
    if (client.memberShipStatus === "EXPIRED" || client.memberShipStatus === "ACTIVE") {
      for (let i = 0; i < 3; i++) {
        const startDate = new Date(baseDate);
        startDate.setMonth(startDate.getMonth() - (i * (client.memberShip === "Quincenal" ? 0.5 : 1)));
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + (client.memberShip === "Quincenal" ? 14 : 29));

        history.push({
          name: client.memberShip || "Membresía",
          start: startDate.toLocaleDateString("es-ES"),
          end: endDate.toLocaleDateString("es-ES"),
          status: i === 0 ? client.memberShipStatus : (endDate < new Date() ? "EXPIRED" : "ACTIVE"),
        });
      }
    }

    return history;
  }, [client]);

  return (
    <div className="card client-stats">
      <div className="client-stats__header">
        <h3>
          <Activity size={18} />
          Estadísticas
        </h3>
      </div>

      <div className="client-stats__grid">
        <div className="client-stats__item">
          <div className="client-stats__icon client-stats__icon--blue">
            <CalendarCheck size={20} />
          </div>
          <div className="client-stats__content">
            <span className="client-stats__value">{stats.totalAttendances}</span>
            <span className="client-stats__label">Total Asistencias</span>
          </div>
        </div>

        <div className="client-stats__item">
          <div className="client-stats__icon client-stats__icon--green">
            <CalendarCheck size={20} />
          </div>
          <div className="client-stats__content">
            <span className="client-stats__value">
              {stats.lastAttendance || "Sin registros"}
            </span>
            <span className="client-stats__label">Última Asistencia</span>
          </div>
        </div>

        <div className="client-stats__item">
          <div className="client-stats__icon client-stats__icon--purple">
            <TrendingUp size={20} />
          </div>
          <div className="client-stats__content">
            <span className="client-stats__value">{stats.averageWeekly}</span>
            <span className="client-stats__label">Promedio Semanal</span>
          </div>
        </div>

        <div className="client-stats__item">
          <div className="client-stats__icon client-stats__icon--yellow">
            <DollarSign size={20} />
          </div>
          <div className="client-stats__content">
            <span className="client-stats__value">${stats.totalSpent}</span>
            <span className="client-stats__label">Total Gastado</span>
          </div>
        </div>

        <div className="client-stats__item">
          <div className="client-stats__icon client-stats__icon--red">
            <ShoppingBag size={20} />
          </div>
          <div className="client-stats__content">
            <span className="client-stats__value">{stats.totalPurchases}</span>
            <span className="client-stats__label">Compras Realizadas</span>
          </div>
        </div>

        <div className="client-stats__item">
          <div className="client-stats__icon client-stats__icon--teal">
            <Award size={20} />
          </div>
          <div className="client-stats__content">
            <span className="client-stats__value">{client.memberShip || "-"}</span>
            <span className="client-stats__label">Membresía Actual</span>
          </div>
        </div>
      </div>

      {membershipHistory.length > 0 && (
        <div className="client-stats__history">
          <h4 className="client-stats__history-title">Historial de Membresías</h4>
          <div className="client-stats__history-list">
            {membershipHistory.map((membership, index) => (
              <div key={index} className="client-stats__history-item">
                <div className="client-stats__history-info">
                  <span className="client-stats__history-name">{membership.name}</span>
                  <span className="client-stats__history-dates">
                    {membership.start} - {membership.end}
                  </span>
                </div>
                <span
                  className={`client-stats__history-badge ${
                    membership.status === "ACTIVE"
                      ? "client-stats__history-badge--active"
                      : "client-stats__history-badge--expired"
                  }`}
                >
                  {membership.status === "ACTIVE" ? "Activa" : "Vencida"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientStats;
