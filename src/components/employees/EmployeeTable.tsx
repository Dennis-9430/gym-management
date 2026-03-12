import type { Employee } from "../../types/employee.types";

interface Props {
  employees: Employee[];
  onSelect: (id: number) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (id: number) => void;
}

const EmployeeTable = ({ employees, onSelect, onEdit, onDelete }: Props) => {
  return (
    <table className="employee-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {employees.map((emp) => (
          <tr key={emp.id} className="employee-row">
            <td className="employee-cell-link" onClick={() => onSelect(emp.id)}>
              {emp.id}
            </td>
            <td className="employee-cell-link" onClick={() => onSelect(emp.id)}>
              {emp.firstName} {emp.lastName}
            </td>
            <td className="employee-cell-link" onClick={() => onSelect(emp.id)}>
              {emp.email}
            </td>
            <td>{emp.role}</td>
            <td>{emp.status}</td>
            <td className="actions">
              <button
                type="button"
                className="btn-edit"
                onClick={() => onEdit(emp)}
              >
                Editar
              </button>
              <button
                type="button"
                className="btn-delete"
                onClick={() => onDelete(emp.id)}
              >
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default EmployeeTable;
