import { Search, Plus } from "lucide-react";
interface Props {
  search: string;
  onSearch: (value: string) => void;
  showAll: () => void;
  filterActiver: () => void;
  onAddClient: () => void;
  title?: string;
  filterMode: "ACTIVE" | "INACTIVE" | "ALL";
}
const ClientSearch = ({
  search,
  onSearch,
  showAll,
  filterActiver,
  onAddClient,
  title = "Lista de Clientes",
  filterMode,
}: Props) => {
  return (
    <div className="client-search-bar">
      <div className="search-actions">
        <h2>{title}</h2>

        <div className="search-input-wrapper">
          <input
            className="client-search"
            type="text"
            placeholder="Buscar usuario"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
          <Search size={18} className="search-icon" />
        </div>

        <div className="search-filters">
          <button
            onClick={showAll}
            className={filterMode === "INACTIVE" ? "active-filter" : ""}
          >
            Todos
          </button>
          <button
            onClick={filterActiver}
            className={filterMode === "ACTIVE" ? "active-filter" : ""}
          >
            Activos
          </button>
          <button className="btn-add-client" onClick={onAddClient}>
            <Plus size={16} />
            Agregar usuario
          </button>
        </div>
      </div>
    </div>
  );
};
export default ClientSearch;
