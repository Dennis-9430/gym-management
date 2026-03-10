import type { User } from "../../types/user.types";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";

interface Props {
  employee: User;
}

const EmployeeRow = ({ employee }: Props) => {
  const navigate = useNavigate();

  const goToProfile = () => {
    navigate(`/employees/${employee.id}`);
  };

  const editEmployee = () => {
    navigate(`/employees/edit/${employee.id}`);
  };

  const deleteEmployee = () => {
    console.log("Eliminar empleado", employee.id);
  };

  return (
    <tr>
      <td>{employee.id}</td>

      <td
        className="employee-link"
        onClick={goToProfile}
        style={{ cursor: "pointer", color: "blue" }}
      >
        {employee.documentNumber}
      </td>

      <td>{employee.lastName}</td>

      <td>{employee.firstName}</td>

      <td>{employee.username}</td>

      <td>{employee.role}</td>

      <td className="actions">
        <button className="btn-edit" onClick={editEmployee}>
          <Pencil size={18} /> Editar
        </button>

        <button className="btn-delete" onClick={deleteEmployee}>
          <Trash2 size={18} /> Eliminar
        </button>
      </td>
    </tr>
  );
};

export default EmployeeRow;
