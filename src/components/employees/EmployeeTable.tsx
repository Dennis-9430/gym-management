import { Pencil, Trash2, Crown, Fingerprint } from "lucide-react";
import type { Employee } from "../../types/employee.types";
import { useAccountType } from "../../hooks/useAccountType";

/* Tabla de empleados con acciones de seleccionar, editar y eliminar */
interface Props {
  employees: Employee[];
  onSelect: (id: string) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  biometricEnabled?: boolean;
  onRegisterFingerprint?: (employeeId: string) => void;
  onDeleteFingerprint?: (employeeId: string) => void;
}

const EmployeeTable = ({ employees, onSelect, onEdit, onDelete, biometricEnabled = false, onRegisterFingerprint, onDeleteFingerprint }: Props) => {
  const { isOwner, isAdmin, isGerente } = useAccountType();

  // Admin, Owner y Gerente ven la columna de acciones
  // Recepcionista NO ve acciones
  const showActions = (isOwner || isGerente || isAdmin);

  return (
    <table className="employee-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Usuario</th>
          <th>Rol</th>
          <th>Estado</th>
          {biometricEnabled && <th>Huella</th>}
          {showActions && <th>Acciones</th>}
        </tr>
      </thead>
      <tbody>
        {employees.map((emp, index) => {
          const isEmployeeOwner = (emp as any).isOwner === true;
          const isEmployeeGerente = emp.role === "GERENTE";
          const isEmployeeRecepcionista = emp.role === "RECEPCIONISTA";

          // Permisos de Editar
          // - Owner/Gerente: puede editar a todos
          // - Admin: solo puede editar recepcionistas
          // - Recepcionista: NO puede editar a nadie
          const canEdit = (isOwner || isGerente)
            ? true // Owner/Gerente puede editar a todos
            : (isAdmin && isEmployeeRecepcionista);

          // Permisos de Eliminar
          // - Owner/Gerente: puede eliminar admins y recepcionistas (NO a si mismo)
          // - Admin: solo puede eliminar recepcionistas
          // - Recepcionista: NO puede eliminar a nadie
          const canDelete = (isOwner || isGerente)
            ? !isEmployeeOwner // Owner/Gerente: elimina admins y recepcionistas (no a si mismo)
            : (isAdmin && isEmployeeRecepcionista);

          return (
            <tr
              key={emp.id ?? `emp-${index}`}
              className={`employee-row ${isEmployeeOwner ? "employee-row--owner" : ""}`}
            >
              <td
                className={`employee-cell-link ${isEmployeeOwner ? "employee-cell-link--owner" : ""}`}
                onClick={() => onSelect(emp.id)}
              >
                {emp.firstName} {emp.lastName}
              </td>
              <td>{emp.email}</td>
              <td>{emp.username || "-"}</td>
              <td>
                {isEmployeeOwner || isEmployeeGerente ? (
                  <span className="employee-badge employee-badge--owner">
                    <Crown size={12} />
                    Gerente
                  </span>
                ) : (
                  <span className="employee-badge employee-badge--employee">
                    {emp.role === "ADMIN" ? "Admin" : "Recepcionista"}
                  </span>
                )}
              </td>
              <td>{emp.status}</td>
              {biometricEnabled && (
                <td>
                  {emp.fingerPrint ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: "#16a34a", fontSize: 16 }}>✅</span>
                      <button
                        type="button"
                        className="btn-delete"
                        style={{ padding: "2px 8px", fontSize: 12 }}
                        onClick={() => onDeleteFingerprint?.(emp.id)}
                      >
                        <Fingerprint size={14} style={{ marginRight: 2 }} />
                        Borrar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn-renew"
                      style={{ padding: "2px 8px", fontSize: 12 }}
                      onClick={() => onRegisterFingerprint?.(emp.id)}
                    >
                      <Fingerprint size={14} style={{ marginRight: 2 }} />
                      Registrar
                    </button>
                  )}
                </td>
              )}
              {showActions && (
                <td className="actions">
                  {canEdit && (
                    <button
                      type="button"
                      className="btn-edit"
                      onClick={() => onEdit(emp)}
                    >
                      <Pencil size={16} />
                      Editar
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      className="btn-delete"
                      onClick={() => onDelete(emp.id)}
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  )}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default EmployeeTable;