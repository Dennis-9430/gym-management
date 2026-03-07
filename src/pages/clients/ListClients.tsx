import ClientSearch from "../../components/clientes/ClientSearch";
import ClientTable from "../../components/clientes/ClientTable";
import { useClients } from "../../hooks/listClientsHook";
import {} from "../../styles/listClients.css";
const ListClients = () => {
  const {
    clients,
    search,
    searchClient,
    sortBy,
    showAll,
    filterActiver,
    sortField,
    sortDirection,
  } = useClients();
  return (
    <>
      <div className="clients-container">
        <ClientSearch
          search={search}
          onSearch={searchClient}
          showAll={showAll}
          filterActiver={filterActiver}
        />
        <ClientTable
          clients={clients}
          sortBy={sortBy}
          sortField={sortField}
          sortDirection={sortDirection}
        />
      </div>
    </>
  );
};

export default ListClients;
