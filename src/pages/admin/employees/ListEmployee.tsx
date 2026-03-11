import EmployeeTable from "../../../components/employeTable/EmployeeTable";
import { useEmployees } from "../../../hooks/useEmployeeListHook";

const ListEmployee = () => {
  const { employees, sortBy } = useEmployees();

  return (
    <div className="employees-container">
      <EmployeeTable employees={employees} sortBy={sortBy} />
    </div>
  );
};

export default ListEmployee;
