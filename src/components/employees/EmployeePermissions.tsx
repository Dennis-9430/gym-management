import type { EmployeeRole } from "../../types/employee.types";
import { getRolePermissions } from "../../services/employeePermissions.service";

interface Props {
  role: EmployeeRole;
}

const EmployeePermissions = ({ role }: Props) => {
  const permissions = getRolePermissions(role);

  return (
    <div className="card">
      <h3>Permisos del sistema</h3>
      <ul>
        {permissions.map((permission) => (
          <li key={permission}>{permission}</li>
        ))}
      </ul>
    </div>
  );
};

export default EmployeePermissions;
