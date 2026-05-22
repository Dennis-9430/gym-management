import { useState, useEffect } from "react";
import ClientSearch from "../../components/clientsTable/ClientSearch";
import ClientTable from "../../components/clientsTable/ClientTable";
import ClientModal from "../../components/clientsModal/ClientModal";
import BackButton from "../../components/common/BackButton";
import { useClients } from "../../hooks/useListClientsHook";
import { usePOS } from "../../hooks/features/usePOS";
import { useAccountType } from "../../hooks/useAccountType";
import { useAuth } from "../../context";
import SubscriptionModal from "../../components/sales/SubscriptionModal";
import { buildUrl, getAuthHeaders } from "../../services/api";
import {} from "../../styles/listClients.css";

/* Pagina de listado de clientes con busqueda y filtros */
const ListClients = () => {
  const { user } = useAuth();
  const { isOwner } = useAccountType();

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
    deleteClient,
    filterMode,
  } = useClients();

  const {
    subscriptionModalOpen,
    subscriptionClient,
    subscriptionSearch,
    setSubscriptionSearch,
    subscriptionResults,
    subscriptionService,
    subscriptionShowServices,
    setSubscriptionShowServices,
    subscriptionPaymentMethod,
    setSubscriptionPaymentMethod,
    subscriptionCashAmount,
    subscriptionTransferAmount,
    subscriptionStartDate,
    setSubscriptionStartDate,
    subscriptionDiscountPercent,
    subscriptionDiscountUsd,
    subscriptionTotal,
    subscriptionPaidValue,
    subscriptionChange,
    setSubscriptionPaid,
    handleCloseSubscriptionModal,
    handleSelectSubscriptionClient,
    handleSelectService,
    handleSubscriptionDiscountPercent,
    handleSubscriptionDiscountUsd,
    handleSubscriptionCashChange,
    handleSubscriptionTransferChange,
    handleRegisterSubscription,
    handlePendingSubscription,
  } = usePOS();

  // Biometric fingerprint state
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    fetch(buildUrl("/api/fingerprints/biometric-config"), {
      headers: { ...getAuthHeaders() },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => setBiometricEnabled(d.biometricEnabled))
      .catch(() => {});
  }, []);

  const handleRegisterFingerprint = async (clientId: number | string) => {
    try {
      await fetch(buildUrl("/api/fingerprints/register"), {
        method: "POST",
        headers: { ...getAuthHeaders() },
        credentials: "include",
        body: JSON.stringify({ entityType: "client", entityId: String(clientId) }),
      });
      reloadClients();
    } catch {
      alert("Error al registrar huella");
    }
  };

  const handleDeleteFingerprint = async (clientId: number | string) => {
    try {
      await fetch(buildUrl(`/api/fingerprints/client/${clientId}`), {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
        credentials: "include",
      });
      reloadClients();
    } catch {
      alert("Error al borrar huella");
    }
  };

  // Gerente y Admin pueden eliminar clientes
  // Recepcionista NO puede eliminar clientes
  const canDeleteClients = isOwner || user?.role === "ADMIN";

  const [showModal, setShowModal] = useState(false);

  /** Maneja la eliminación de un cliente */
  const handleDeleteClient = async (clientId: number | string) => {
    if (!canDeleteClients) {
      alert("No tienes permisos para eliminar clientes.");
      return;
    }
    const success = await deleteClient(clientId);
    if (!success) {
      alert("Error al eliminar el cliente.");
    }
  };

  const showActions = filterMode === "INACTIVE" || filterMode === "ALL";

  /** Abre modal para nuevo cliente */
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
        <div className="page-header-row">
          <BackButton />
          <h2>Clientes</h2>
        </div>
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
          showActions={showActions}
          onDelete={canDeleteClients ? handleDeleteClient : undefined}
          biometricEnabled={biometricEnabled}
          onRegisterFingerprint={handleRegisterFingerprint}
          onDeleteFingerprint={handleDeleteFingerprint}
        />
      </div>

      {showModal && (
        <ClientModal onClose={handleCloseModal} onSaved={handleSaved} />
      )}

      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={handleCloseSubscriptionModal}
        search={subscriptionSearch}
        onSearchChange={setSubscriptionSearch}
        clientResults={subscriptionResults}
        onSelectClient={handleSelectSubscriptionClient}
        selectedClient={subscriptionClient}
        selectedService={subscriptionService}
        showServices={subscriptionShowServices}
        onToggleServices={() =>
          setSubscriptionShowServices(!subscriptionShowServices)
        }
        onSelectService={handleSelectService}
        startDate={subscriptionStartDate}
        onStartDateChange={setSubscriptionStartDate}
        paymentMethod={subscriptionPaymentMethod}
        onPaymentMethodChange={setSubscriptionPaymentMethod}
        cashAmount={subscriptionCashAmount}
        transferAmount={subscriptionTransferAmount}
        onCashChange={handleSubscriptionCashChange}
        onTransferChange={handleSubscriptionTransferChange}
        discountPercent={subscriptionDiscountPercent}
        discountUsd={subscriptionDiscountUsd}
        total={subscriptionTotal}
        paidValue={subscriptionPaidValue}
        change={subscriptionChange}
        onDiscountPercentChange={handleSubscriptionDiscountPercent}
        onDiscountUsdChange={handleSubscriptionDiscountUsd}
        onPaidChange={setSubscriptionPaid}
        onRegister={handleRegisterSubscription}
        onPending={handlePendingSubscription}
      />
    </>
  );
};

export default ListClients;
