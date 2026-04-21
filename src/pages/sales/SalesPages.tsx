/* Pagina principal de ventas POS */
import { useState } from "react";
import { useAuth } from "../../context/index.ts";
import { useLocation, useNavigate } from "react-router-dom";
import { usePOS } from "../../hooks/features/usePOS";
import SalesDashboard from "../../components/sales/SalesDashboard";
import SaleModal from "../../components/sales/SaleModal";
import SubscriptionModal from "../../components/sales/SubscriptionModal";
import MembershipModal from "../../components/sales/MembershipModal";
import type { ClientForm } from "../../types/client.types";
import type { Service } from "../../types/payment.types";
import { services } from "../../types/payment.types";
import "../../styles/pos.css";

const SalesPages = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    openSubscriptionModal?: boolean;
    client?: ClientForm;
  } | null;
  const initialClient = state?.client;

  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [membershipModalOpen, setMembershipModalOpen] = useState(false);
  const [membershipServices, setMembershipServices] = useState<Service[]>(services);

  const handleSaveMembership = (service: Service) => {
    setMembershipServices((prev) => {
      const existing = prev.find((s) => s.id === service.id);
      if (existing) {
        return prev.map((s) => (s.id === service.id ? service : s));
      }
      return [...prev, service];
    });
  };

  const handleDeleteMembership = (id: number) => {
    setMembershipServices((prev) => prev.filter((s) => s.id !== id));
  };

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
      <SalesDashboard
        onOpenSubscriptionModal={() => handleOpenSubscriptionModal()}
        onOpenSaleModal={() => setSaleModalOpen(true)}
        onOpenMembershipModal={isAdmin ? () => setMembershipModalOpen(true) : undefined}
        onOpenConfigModal={isAdmin ? () => navigate("/sales/config") : undefined}
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
        taxRate={taxRate}
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

      {isAdmin && (
        <MembershipModal
          isOpen={membershipModalOpen}
          onClose={() => setMembershipModalOpen(false)}
          services={membershipServices}
          onSave={handleSaveMembership}
          onDelete={handleDeleteMembership}
        />
      )}
    </main>
  );
};

export default SalesPages;
