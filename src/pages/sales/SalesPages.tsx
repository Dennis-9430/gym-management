/*
 * ============================================================
 * REFACTORIZADO: Card.tsx -> SalesPages.tsx
 * Fecha: 2026-03-16
 *
 * Cambios realizados:
 * - Extraída toda la lógica de negocio al hook usePOS
 * - Extraídos componentes de UI a src/components/sales/
 * - Eliminado código redundante (funciones ya existentes en utils)
 * - Estructura más limpia y mantenible
 *
 * Componentes extraídos:
 * - SalesDashboard.tsx: Cards de navegación
 * - PendingSubscriptions.tsx: Tabla de suscripciones pendientes
 * - SaleModal.tsx: Modal de venta de productos
 * - SubscriptionModal.tsx: Modal de suscripciones
 * ============================================================
 */
import { useAuth } from "../../context/AuthContext";
import { usePOS } from "../../hooks/features/usePOS";
import SalesDashboard from "../../components/sales/SalesDashboard";
import SaleModal from "../../components/sales/SaleModal";
import SubscriptionModal from "../../components/sales/SubscriptionModal";
import "../../styles/pos.css";

const SalesPages = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

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
    search,
    filteredCatalog,

    // Subscription state
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
  } = usePOS();

  const discountPercent = Number((discountRate * 100).toFixed(2));
  const taxPercent = Number((taxRate * 100).toFixed(2));

  return (
    <main className="pos-container">
      <SalesDashboard
        onOpenSubscriptionModal={() => handleOpenSubscriptionModal()}
        onOpenSaleModal={() => setSaleModalOpen(true)}
      />

      <SaleModal
        isOpen={saleModalOpen}
        onClose={handleCloseModal}
        clientInput={saleClientInput}
        onClientInputChange={setSaleClientInput}
        clientResults={saleClientResults}
        onSelectClient={handleSelectSaleClient}
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
    </main>
  );
};

export default SalesPages;
