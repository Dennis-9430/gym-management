import EmployeeTable from "../../../components/employeTable/EmployeeTable";
import { useEmployees } from "../../../hooks/useEmployeeListHook";

const ListEmployee = () => {
  const { employees, sortBy, sortField, sortDirection } = useEmployees();

  return (
    <div className="employees-container">
      <EmployeeTable
        employees={employees}
        sortBy={sortBy}
        /*sortField={sortField}*/
        sortDirection={sortDirection}
      />
    </div>
  );
};

export default ListEmployee;
