import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Filter, Users, UserCog } from "lucide-react";
import { getClients } from "../../services/clients.service";
import { getEmployees } from "../../services/employees.service";
import "../../styles/attendance.css";

type PersonType = "clients" | "employees";
type DateFilter = "today" | "week" | "month";

interface AttendanceRecord {
  id: number;
  type: PersonType;
  documentNumber: string;
  fullName: string;
  membershipExpiry: string | null;
  checkIn: string;
  checkOut: string | null;
}

const AttendancePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<PersonType>("clients");
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [searchQuery, setSearchQuery] = useState("");

  const clients = getClients();
  const employees = getEmployees().filter((e) => e.status === "ACTIVO");

  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (dateFilter) {
      case "today":
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case "week":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        return { start: weekStart, end: weekEnd };
      case "month":
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        return { start: monthStart, end: monthEnd };
      default:
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
    }
  };

  const generateMockAttendance = (): AttendanceRecord[] => {
    const records: AttendanceRecord[] = [];
    const { start, end } = getDateRange();

    if (activeTab === "clients") {
      clients.slice(0, 8).forEach((client, index) => {
        const randomTime = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        const hasCheckout = Math.random() > 0.4;

        records.push({
          id: index + 1,
          type: "clients",
          documentNumber: client.documentNumber,
          fullName: `${client.firstName} ${client.lastName}`,
          membershipExpiry: client.memberShipEndDate
            ? new Date(client.memberShipEndDate).toLocaleDateString("es-ES")
            : null,
          checkIn: randomTime.toLocaleString("es-ES"),
          checkOut: hasCheckout
            ? new Date(randomTime.getTime() + 60 * 60 * 1000).toLocaleString("es-ES")
            : null,
        });
      });
    } else {
      employees.slice(0, 5).forEach((employee, index) => {
        const randomTime = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

        records.push({
          id: index + 1,
          type: "employees",
          documentNumber: employee.documentNumber,
          fullName: `${employee.firstName} ${employee.lastName}`,
          membershipExpiry: null,
          checkIn: randomTime.toLocaleString("es-ES"),
          checkOut: new Date(randomTime.getTime() + 8 * 60 * 60 * 1000).toLocaleString("es-ES"),
        });
      });
    }

    return records;
  };

  const attendanceRecords = generateMockAttendance();

  const filteredRecords = attendanceRecords.filter((record) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      record.documentNumber.toLowerCase().includes(query) ||
      record.fullName.toLowerCase().includes(query)
    );
  });

  const formatDateLabel = () => {
    switch (dateFilter) {
      case "today":
        return new Date().toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      case "week":
        return "Esta semana";
      case "month":
        return new Date().toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
        });
    }
  };

  return (
    <main className="attendance-page">
      <div className="attendance-header">
        <div className="attendance-header__left">
          <button className="btn-back" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={20} />
            Volver
          </button>
          <div>
            <h2 className="attendance-title">Historial de Asistencia</h2>
            <p className="attendance-subtitle">{formatDateLabel()}</p>
          </div>
        </div>

        <div className="attendance-filters">
          <div className="attendance-search">
            <Search size={18} className="attendance-search__icon" />
            <input
              type="text"
              placeholder="Buscar por cédula o nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="attendance-search__input"
            />
          </div>

          <div className="attendance-date-filter">
            <Filter size={18} />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="attendance-date-filter__select"
            >
              <option value="today">Hoy</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mes</option>
            </select>
          </div>
        </div>
      </div>

      <div className="attendance-tabs">
        <button
          className={`attendance-tab ${activeTab === "clients" ? "attendance-tab--active" : ""}`}
          onClick={() => setActiveTab("clients")}
        >
          <Users size={18} />
          Clientes
        </button>
        <button
          className={`attendance-tab ${activeTab === "employees" ? "attendance-tab--active" : ""}`}
          onClick={() => setActiveTab("employees")}
        >
          <UserCog size={18} />
          Empleados
        </button>
      </div>

      <div className="attendance-table-wrapper">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Cédula</th>
              <th>Nombre Completo</th>
              {activeTab === "clients" && <th>Expira Membresía</th>}
              <th>Hora Entrada</th>
              <th>Hora Salida</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={activeTab === "clients" ? 6 : 5} className="attendance-empty">
                  No hay registros de asistencia
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record.id}>
                  <td className="attendance-document">{record.documentNumber}</td>
                  <td className="attendance-name">{record.fullName}</td>
                  {activeTab === "clients" && (
                    <td className="attendance-expiry">
                      {record.membershipExpiry || "-"}
                    </td>
                  )}
                  <td className="attendance-time">{record.checkIn}</td>
                  <td className="attendance-time">{record.checkOut || "-"}</td>
                  <td className="attendance-status">
                    <span
                      className={`attendance-badge ${
                        record.checkOut ? "attendance-badge--out" : "attendance-badge--in"
                      }`}
                    >
                      {record.checkOut ? "Completado" : "En gym"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </main>
  );
};

export default AttendancePage;
