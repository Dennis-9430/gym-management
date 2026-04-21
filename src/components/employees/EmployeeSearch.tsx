import { Search } from "lucide-react";

/* Buscador de empleados */
interface Props {
  value: string;
  onChange: (value: string) => void;
}

const EmployeeSearch = ({ value, onChange }: Props) => {
  return (
    <div className="employees-search">
      <Search className="search-icon" size={18} />
      <input
        className="employee-search"
        type="text"
        placeholder="Buscar empleado"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default EmployeeSearch;
