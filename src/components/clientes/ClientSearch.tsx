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
        <h2> Lista de Clientes</h2>
        <input
          className="client-search"
          type="text"
          placeholder="Buscar cliente"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        <button onClick={showAll}>Todos</button>
        <button onClick={filterActiver}>Activos</button>
      </div>
    </div>
  );
};
export default ClientSearch;
