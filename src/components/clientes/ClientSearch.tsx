import { Search } from "lucide-react";
interface Props {
  search: string;
  onSearch: (value: string) => void;
  showAll: () => void;
  filterActiver: () => void;
}
const ClientSearch = ({ search, onSearch, showAll, filterActiver }: Props) => {
  return (
    <div className="clietn-search-bar">
      <div className="search-actions">
        <h2>Lista de Clientes</h2>

        <div className="search-input-wrapper">
          <input
            className="client-search"
            type="text"
            placeholder="Buscar cliente"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
          <Search size={18} className="search-icon" />
        </div>

        <div className="search-filters">
          <button onClick={showAll}>Todos</button>
          <button className="active-filter" onClick={filterActiver}>
            Activos
          </button>
        </div>
      </div>
    </div>
  );
};
export default ClientSearch;
