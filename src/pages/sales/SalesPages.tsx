/* Pagina principal de ventas POS */
import { useState, useEffect } from "react";
import { useAuth } from "../../context/index.ts";
import { useLocation } from "react-router-dom";
import { usePOS } from "../../hooks/features/usePOS";
import SalesDashboard from "../../components/sales/SalesDashboard";
import SaleModal from "../../components/sales/SaleModal";
import SubscriptionModal from "../../components/sales/SubscriptionModal";
import MembershipModal from "../../components/sales/MembershipModal";
import BackButton from "../../components/common/BackButton";
import type { ClientForm } from "../../types/client.types";
import type { Service } from "../../types/payment.types";
import { getServices } from "../../services/services.service";
import "../../styles/pos.css";

const SalesPages = () => {
  const location = useLocation();
  const state = location.state as {
    openSubscriptionModal?: boolean;
    client?: ClientForm;
  } | null;
  const initialClient = state?.client;

  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const canManageMemberships = isAdmin || user?.role === "GERENTE";
  const [membershipModalOpen, setMembershipModalOpen] = useState(false);
  const [membershipServices, setMembershipServices] = useState<Service[]>([]);

  const loadMembershipServices = () => {
    getServices()
      .then(setMembershipServices)
      .catch(() => setMembershipServices([]));
  };

  // Carga servicios una sola vez al montar
  useEffect(() => {
    loadMembershipServices();
  }, []);

  const {
    // State
    saleModalOpen,
    subscriptionModalOpen,

    // Sale state
    saleClientInput,
    paymentMethod,
    cashAmount,
    transferAmount,
    voucherCode,
    generateInvoice,
    invoiceEmail,
    cashReceived,
    handleCashReceivedChange,
    saleChange,
    saleClientResults,
    matchedSaleClient,
    search,
    filteredCatalog,

    // Subscription state
    subscriptionClient,
    subscriptionSearch,
    subscriptionService,
    subscriptionShowServices,
    subscriptionPaymentMethod,
    subscriptionCashAmount,
    subscriptionTransferAmount,
    subscriptionStartDate,
    subscriptionDiscountPercent,
    subscriptionDiscountUsd,
    subscriptionResults,
    subscriptionTotal,
    subscriptionPaidValue,
    subscriptionChange,

    // Cart
    items,
    taxRate,
    totals,
    discountRate,

    // Actions
    setSaleClientInput,
    setPaymentMethod,
    setVoucherCode,
    setSaleModalOpen,
    setGenerateInvoice,
    setInvoiceEmail,
    setSearch,
    setSubscriptionSearch,
    setSubscriptionShowServices,
    setSubscriptionPaymentMethod,
    setSubscriptionPaid,
    setSubscriptionStartDate,

    // Handlers
    handleQtyChange,
    handleDiscountChange,
    handleTaxChange,
    handleClear,
    handleCheckout,
    handleCashChange,
    handleTransferChange,
    handleAddFromSearch,
    handleSelectSaleClient,
    handleConsumerFinal,
    handleCloseModal,
    handleOpenSubscriptionModal,
    handleCloseSubscriptionModal,
    handleSelectSubscriptionClient,
    handleSelectService,
    handleSubscriptionDiscountPercent,
    handleSubscriptionDiscountUsd,
    handleSubscriptionCashChange,
    handleSubscriptionTransferChange,
    handleRegisterSubscription,
    handlePendingSubscription,
    updateItemDiscount,
    removeItem,
  } = usePOS(initialClient);

  const discountPercent = Number((discountRate * 100).toFixed(2));
  const taxPercent = Number((taxRate * 100).toFixed(2));

  return (
    <main className="pos-container">
      <div className="page-header-row">
        <BackButton />
        <h2>Ventas</h2>
      </div>
      <SalesDashboard
        onOpenSubscriptionModal={() => handleOpenSubscriptionModal()}
        onOpenSaleModal={() => setSaleModalOpen(true)}
        onOpenMembershipModal={canManageMemberships ? () => setMembershipModalOpen(true) : undefined}
      />

      <SaleModal
        isOpen={saleModalOpen}
        onClose={handleCloseModal}
        clientInput={saleClientInput}
        onClientInputChange={setSaleClientInput}
        clientResults={saleClientResults}
        onSelectClient={handleSelectSaleClient}
        selectedClient={matchedSaleClient}
        onSelectConsumerFinal={handleConsumerFinal}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        cashAmount={cashAmount}
        transferAmount={transferAmount}
        voucherCode={voucherCode}
        onCashChange={handleCashChange}
        onTransferChange={handleTransferChange}
        onVoucherChange={setVoucherCode}
        search={search}
        onSearchChange={setSearch}
        filteredCatalog={filteredCatalog}
        onAddItem={handleAddFromSearch}
        items={items}
        onQtyChange={handleQtyChange}
        onDiscountChange={updateItemDiscount}
        onRemoveItem={removeItem}
        onClearCart={handleClear}
        totals={totals}
        discountPercent={discountPercent}
        taxPercent={taxPercent}
        isAdmin={isAdmin}
        onDiscountRateChange={handleDiscountChange}
        onTaxRateChange={handleTaxChange}
        onCheckout={handleCheckout}
        generateInvoice={generateInvoice}
        onGenerateInvoiceChange={setGenerateInvoice}
        invoiceEmail={invoiceEmail}
        onInvoiceEmailChange={setInvoiceEmail}
        cashReceived={cashReceived}
        onCashReceivedChange={handleCashReceivedChange}
        saleChange={saleChange}
      />

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
        services={membershipServices}
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

      {canManageMemberships && (
        <MembershipModal
          isOpen={membershipModalOpen}
          onClose={() => setMembershipModalOpen(false)}
          services={membershipServices}
          onRefresh={loadMembershipServices}
        />
      )}
    </main>
  );
};

export default SalesPages;
