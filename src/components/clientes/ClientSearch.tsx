interface Props {
  search: string;
  onSearch: (value: string) => void;
}
const ClientSearch = ({ search, onSearch }: Props) => {
  return (
    <>
      <h2> Lista de Clientes</h2>
      <input
        className="client-search"
        type="text"
        placeholder="Buscar cliente"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />
    </>
  );
};
export default ClientSearch;
