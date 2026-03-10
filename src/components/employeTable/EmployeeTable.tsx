import type { User } from "../../types/user.types";
import EmployeeRow from "./EmployeeRow";

interface Props {
  employees: User[];
  sortBy: (field: keyof User) => void;
}

const EmployeeTable = ({ employees, sortBy }: Props) => {
  return (
    <table className="employee-table">
      <thead>
        <tr>
          <th>ID</th>
          <th onClick={() => sortBy("documentNumber")}>Cédula</th>
          <th onClick={() => sortBy("lastName")}>Apellidos</th>
          <th onClick={() => sortBy("firstName")}>Nombres</th>
          <th onClick={() => sortBy("username")}>Usuario</th>
          <th>Rol</th>
        </tr>
      </thead>

      <tbody>
        {employees.map((emp) => (
          <EmployeeRow key={emp.id} employee={emp} />
        ))}
      </tbody>
    </table>
  );
};

export default EmployeeTable;
