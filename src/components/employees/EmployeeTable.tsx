import { Pencil, Trash2, Crown } from "lucide-react";
import type { Employee } from "../../types/employee.types";
import { useAccountType } from "../../hooks/useAccountType";

/* Tabla de empleados con acciones de seleccionar, editar y eliminar */
interface Props {
  employees: Employee[];
  onSelect: (id: number | string) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (id: number | string) => void;
}

const EmployeeTable = ({ employees, onSelect, onEdit, onDelete }: Props) => {
  const { isOwner, isDemo, isAdmin } = useAccountType();

  // Solo Gerente y Admin ven la columna de acciones
  // Recepcionista NO ve acciones
  const showActions = (isOwner || (isAdmin && !isDemo));

  return (
    <table className="employee-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Usuario</th>
          <th>Rol</th>
          <th>Estado</th>
          {showActions && <th>Acciones</th>}
        </tr>
      </thead>
      <tbody>
        {employees.map((emp, index) => {
          const isEmployeeOwner = (emp as any).isOwner === true;
          const isEmployeeRecepcionista = emp.role === "RECEPCIONISTA";

          // Permisos de Editar
          // - Gerente: puede editar a todos
          // - Admin: solo puede editar recepcionistas
          // - Recepcionista: NO puede editar a nadie
          const canEdit = isOwner
            ? true // Gerente puede editar a todos
            : (isAdmin && isEmployeeRecepcionista);

          // Permisos de Eliminar
          // - Gerente: puede eliminar admins y recepcionistas (NO a sí mismo)
          // - Admin: solo puede eliminar recepcionistas
          // - Recepcionista: NO puede eliminar a nadie
          const canDelete = isOwner
            ? !isEmployeeOwner // Gerente: elimina admins y recepcionistas (no a sí mismo)
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
                {isEmployeeOwner ? (
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