import ClientSearch from "../../components/clientes/ClientSearch";
import ClientTable from "../../components/clientes/ClientTable";
import { useClients } from "../../hooks/listClients";
import {} from "../../styles/lisClients.css";
const ListClients = () => {
  const { clients, search, searchClient } = useClients();
  return (
    <>
      <div className="clients-container">
        <ClientSearch search={search} onSearch={searchClient} />
        <ClientTable clients={clients} />
      </div>
    </>
  );
};

export default ListClients;
