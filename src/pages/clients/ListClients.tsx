import { useState } from "react";
import ClientSearch from "../../components/clientsTable/ClientSearch";
import ClientTable from "../../components/clientsTable/ClientTable";
import ClientModal from "../../components/clients/ClientModal";
import { useClients } from "../../hooks/useListClientsHook";
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
    totalClients,
    activeClients,
    reloadClients,
    filterMode,
  } = useClients();
  const [showModal, setShowModal] = useState(false);

  const openNewModal = () => {
    setShowModal(true);
  };

  const handleSaved = () => {
    reloadClients();
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <div className="clients-container">
        <ClientSearch
          search={search}
          onSearch={searchClient}
          showAll={showAll}
          filterActiver={filterActiver}
          onAddClient={openNewModal}
          title="Usuarios"
          filterMode={filterMode}
        />
        <ClientTable
          clients={clients}
          totalClients={totalClients}
          activeClients={activeClients}
          sortBy={sortBy}
          sortField={sortField}
          sortDirection={sortDirection}
          showActions={filterMode === "INACTIVE"}
          onRefresh={reloadClients}
        />
      </div>

      {showModal && (
        <ClientModal onClose={handleCloseModal} onSaved={handleSaved} />
      )}
    </>
  );
};

export default ListClients;
