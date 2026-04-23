import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { getClients } from "../../services/clients.service";
import { getAttendanceByDate, type AttendanceRecord as ApiAttendanceRecord } from "../../services/attendance.service";
import "../../styles/attendance.css";

type PersonType = "clients";
type DateFilter = "today" | "week" | "month";

interface DisplayRecord {
  id: string;
  type: PersonType;
  documentNumber: string;
  fullName: string;
  membershipExpiry: string | null;
  checkIn: string;
  checkOut: string | null;
}

const formatDateForApi = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
};

const AttendancePage = () => {
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<DisplayRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClients().then(setClients).catch(console.error);
  }, []);

  useEffect(() => {
    const loadAttendance = async () => {
      setLoading(true);
      const now = new Date();
      let targetDate = formatDateForApi(now);

      if (dateFilter === "week") {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        targetDate = formatDateForApi(weekStart);
      } else if (dateFilter === "month") {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        targetDate = formatDateForApi(monthStart);
      }

      try {
        const records = await getAttendanceByDate(targetDate);
        const mappedRecords = records.map((record: ApiAttendanceRecord) => {
          const client = clients.find(c => 
            c.firstName + " " + c.lastName === record.clientName
          );
          return {
            id: record._id,
            type: "clients" as PersonType,
            documentNumber: client?.documentNumber || "",
            fullName: record.clientName,
            membershipExpiry: client?.memberShipEndDate
              ? new Date(client.memberShipEndDate).toLocaleDateString("es-ES")
              : null,
            checkIn: formatTime(record.checkIn),
            checkOut: record.checkOut ? formatTime(record.checkOut) : null,
          };
        });
        setAttendanceRecords(mappedRecords);
      } catch (error) {
        console.error("Error cargando asistencia:", error);
        setAttendanceRecords([]);
      } finally {
        setLoading(false);
      }
    };

    if (clients.length > 0) {
      loadAttendance();
    }
  }, [dateFilter, clients]);

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
          <h2 className="attendance-title">Historial de Asistencia</h2>
          <p className="attendance-subtitle">{formatDateLabel()}</p>
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

      <div className="attendance-table-wrapper">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Cédula</th>
              <th>Nombre Completo</th>
              <th>Expira Membresía</th>
              <th className="attendance-th--hide-mobile">Hora Entrada</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="attendance-empty">
                  Cargando...
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={4} className="attendance-empty">
                  No hay registros de asistencia
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record.id}>
                  <td className="attendance-document">{record.documentNumber}</td>
                  <td className="attendance-name">{record.fullName}</td>
                  <td className="attendance-expiry">
                    {record.membershipExpiry || "-"}
                  </td>
                  <td className="attendance-time attendance-td--hide-mobile">{record.checkIn}</td>
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
