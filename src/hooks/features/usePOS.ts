import { useMemo, useCallback, useEffect } from "react";
import { getProducts } from "../../services/products.service";
import { services } from "../../types/payment.types";
import type { CatalogItem } from "../../types/pos.types";
import { PRODUCT_CATEGORY_LABELS } from "../../types/product.types";
import type { PaymentMethod } from "../../types/sales.types";
import type { Service } from "../../types/payment.types";
import type { ClientForm } from "../../types/client.types";
import { useCart } from "../../hooks/useCart";
import { usePOSClients } from "./usePOSClients";
import { usePOSSales } from "./usePOSSales";
import { usePOSSubscription } from "./usePOSSubscription";
import { matchesQuery } from "../../utils/string/normalize";

const buildCatalog = (): CatalogItem[] => {
  const products = getProducts();
  const productItems: CatalogItem[] = products
    .filter((product) => product.category !== "SERVICIOS_GYM")
    .map((product) => ({
      key: `product-${product.id}`,
      id: product.id,
      name: product.name,
      description: product.description,
      category: PRODUCT_CATEGORY_LABELS[product.category],
      unitPrice: product.unitPrice,
      stock: product.quantity,
      source: "PRODUCT",
    }));

  const membershipItems: CatalogItem[] = services.map((service) => ({
    key: `membership-${service.id}`,
    id: service.id,
    name: service.name,
    description: "Servicio del gimnasio",
    category: PRODUCT_CATEGORY_LABELS.SERVICIOS_GYM,
    unitPrice: service.price,
    stock: null,
    source: "MEMBERSHIP",
  }));

  return [...productItems, ...membershipItems];
};

export interface UsePOSReturn {
  clients: ReturnType<typeof usePOSClients>["clients"];
  catalog: CatalogItem[];
  search: ReturnType<typeof usePOSClients>["search"];
  filteredCatalog: CatalogItem[];
  pendingClients: ReturnType<typeof usePOSClients>["pendingClients"];
  
  saleClientInput: string;
  paymentMethod: PaymentMethod;
  cashAmount: number;
  transferAmount: number;
  voucherCode: string;
  saleModalOpen: boolean;
  saleClientResults: ReturnType<typeof usePOSClients>["saleClientResults"];
  matchedSaleClient: ReturnType<typeof usePOSClients>["matchedSaleClient"];
  
  subscriptionModalOpen: boolean;
  subscriptionSearch: string;
  subscriptionClient: ReturnType<typeof usePOSClients>["subscriptionClient"];
  subscriptionService: Service | null;
  subscriptionShowServices: boolean;
  subscriptionPaymentMethod: PaymentMethod;
  subscriptionCashAmount: number;
  subscriptionTransferAmount: number;
  subscriptionPaid: number;
  subscriptionStartDate: string;
  subscriptionDiscountPercent: number;
  subscriptionDiscountUsd: number;
  subscriptionResults: ReturnType<typeof usePOSSubscription>["subscriptionResults"];
  subscriptionBase: number;
  subscriptionTotal: number;
  subscriptionPaidValue: number;
  subscriptionChange: number;
  
  discountPercent: number;
  taxPercent: number;
  discountRate: number;
  taxRate: number;
  setDiscountRate: (rate: number) => void;
  setTaxRate: (rate: number) => void;
  
  setSearch: (search: string) => void;
  setSaleClientInput: (value: string) => void;
  setPaymentMethod: (value: PaymentMethod) => void;
  setCashAmount: (value: number) => void;
  setTransferAmount: (value: number) => void;
  setVoucherCode: (value: string) => void;
  setSaleModalOpen: (value: boolean) => void;
  
  setSubscriptionModalOpen: (value: boolean) => void;
  setSubscriptionSearch: (value: string) => void;
  setSubscriptionClient: (client: ReturnType<typeof usePOSClients>["subscriptionClient"]) => void;
  setSubscriptionService: (service: Service | null) => void;
  setSubscriptionShowServices: (value: boolean) => void;
  setSubscriptionPaymentMethod: (value: PaymentMethod) => void;
  setSubscriptionCashAmount: (value: number) => void;
  setSubscriptionTransferAmount: (value: number) => void;
  setSubscriptionPaid: (value: number) => void;
  setSubscriptionStartDate: (value: string) => void;
  setSubscriptionDiscountPercent: (value: number) => void;
  setSubscriptionDiscountUsd: (value: number) => void;
  
  reloadClients: () => void;
  handleQtyChange: (key: string, quantity: number) => void;
  handleDiscountChange: (value: number) => void;
  handleTaxChange: (value: number) => void;
  handleClear: () => void;
  handleCheckout: () => void;
  handleCashChange: (value: number) => void;
  handleTransferChange: (value: number) => void;
  handleAddFromSearch: (item: CatalogItem) => void;
  handleSelectSaleClient: (client: ReturnType<typeof usePOSClients>["clients"][number]) => void;
  handleConsumerFinal: () => void;
  handleCloseModal: () => void;
  handleOpenSubscriptionModal: (client?: ReturnType<typeof usePOSClients>["clients"][number]) => void;
  handleCloseSubscriptionModal: () => void;
  handleSelectSubscriptionClient: (client: ReturnType<typeof usePOSClients>["clients"][number]) => void;
  handleClearSubscriptionClient: () => void;
  handleSelectService: (service: Service) => void;
  handleSubscriptionDiscountPercent: (value: number) => void;
  handleSubscriptionDiscountUsd: (value: number) => void;
  handleSubscriptionCashChange: (value: number) => void;
  handleSubscriptionTransferChange: (value: number) => void;
  handleRegisterSubscription: () => void;
  handlePendingSubscription: () => void;
  handleDeletePending: (client: ReturnType<typeof usePOSClients>["clients"][number]) => void;
  
  items: ReturnType<typeof useCart>["items"];
  addItem: ReturnType<typeof useCart>["addItem"];
  updateQuantity: ReturnType<typeof useCart>["updateQuantity"];
  updateItemDiscount: ReturnType<typeof useCart>["updateItemDiscount"];
  removeItem: ReturnType<typeof useCart>["removeItem"];
  clearCart: ReturnType<typeof useCart>["clearCart"];
  totals: ReturnType<typeof useCart>["totals"];
}

export const usePOS = (initialSubscriptionClient?: ClientForm): UsePOSReturn => {
  const cart = useCart();
  const sales = usePOSSales(cart.totals, cart.items, cart.clearCart, null);
  const clients = usePOSClients(initialSubscriptionClient, sales.saleClientInput);
  const subscription = usePOSSubscription(clients.clients, clients.reloadClients, initialSubscriptionClient);

  useEffect(() => {
    if (!clients.clients.length) {
      clients.reloadClients();
    }
  }, [clients.clients, clients.reloadClients]);

  useEffect(() => {
    if (initialSubscriptionClient) {
      subscription.setSubscriptionModalOpen(true);
    }
  }, []);
  
  const catalog = useMemo(() => buildCatalog(), []);

  const filteredCatalog = useMemo(() => {
    if (!clients.search.trim()) {
      return [];
    }
    return catalog.filter((item) =>
      matchesQuery(`${item.name} ${item.description} ${item.category}`, clients.search),
    );
  }, [catalog, clients.search]);

  const handleQtyChange = useCallback((key: string, quantity: number) => {
    if (Number.isNaN(quantity) || !Number.isFinite(quantity)) {
      cart.updateQuantity(key, 1);
      return;
    }
    cart.updateQuantity(key, quantity);
  }, [cart.updateQuantity]);

  const handleDiscountChange = useCallback((value: number) => {
    const percent = Math.min(Math.max(value, 0), 100);
    cart.setDiscountRate(percent / 100);
  }, [cart.setDiscountRate]);

  const handleTaxChange = useCallback((value: number) => {
    const percent = Math.min(Math.max(value, 0), 100);
    cart.setTaxRate(percent / 100);
  }, [cart.setTaxRate]);

  const handleClear = useCallback(() => {
    if (!cart.items.length) {
      return;
    }
    if (confirm("Deseas limpiar el carrito?")) {
      cart.clearCart();
    }
  }, [cart.items.length, cart.clearCart]);

  const handleAddFromSearch = useCallback((item: CatalogItem) => {
    cart.addItem(item);
    clients.setSearch("");
  }, [cart.addItem, clients.setSearch]);

  const discountPercent = Number((cart.discountRate * 100).toFixed(2));
  const taxPercent = Number((cart.taxRate * 100).toFixed(2));

  return {
    clients: clients.clients,
    catalog,
    search: clients.search,
    filteredCatalog,
    pendingClients: clients.pendingClients,
    
    saleClientInput: sales.saleClientInput,
    paymentMethod: sales.paymentMethod,
    cashAmount: sales.cashAmount,
    transferAmount: sales.transferAmount,
    voucherCode: sales.voucherCode,
    saleModalOpen: sales.saleModalOpen,
    saleClientResults: clients.saleClientResults,
    matchedSaleClient: clients.matchedSaleClient,
    
    subscriptionModalOpen: subscription.subscriptionModalOpen,
    subscriptionSearch: subscription.subscriptionSearch,
    subscriptionClient: subscription.subscriptionClient,
    subscriptionService: subscription.subscriptionService,
    subscriptionShowServices: subscription.subscriptionShowServices,
    subscriptionPaymentMethod: subscription.subscriptionPaymentMethod,
    subscriptionCashAmount: subscription.subscriptionCashAmount,
    subscriptionTransferAmount: subscription.subscriptionTransferAmount,
    subscriptionPaid: subscription.subscriptionPaid,
    subscriptionStartDate: subscription.subscriptionStartDate,
    subscriptionDiscountPercent: subscription.subscriptionDiscountPercent,
    subscriptionDiscountUsd: subscription.subscriptionDiscountUsd,
    subscriptionResults: subscription.subscriptionResults,
    subscriptionBase: subscription.subscriptionBase,
    subscriptionTotal: subscription.subscriptionTotal,
    subscriptionPaidValue: subscription.subscriptionPaidValue,
    subscriptionChange: subscription.subscriptionChange,
    
    discountPercent,
    taxPercent,
    discountRate: cart.discountRate,
    taxRate: cart.taxRate,
    setDiscountRate: cart.setDiscountRate,
    setTaxRate: cart.setTaxRate,
    
    setSearch: clients.setSearch,
    setSaleClientInput: sales.setSaleClientInput,
    setPaymentMethod: sales.setPaymentMethod,
    setCashAmount: sales.setCashAmount,
    setTransferAmount: sales.setTransferAmount,
    setVoucherCode: sales.setVoucherCode,
    setSaleModalOpen: sales.setSaleModalOpen,
    
    setSubscriptionModalOpen: subscription.setSubscriptionModalOpen,
    setSubscriptionSearch: subscription.setSubscriptionSearch,
    setSubscriptionClient: subscription.setSubscriptionClient,
    setSubscriptionService: subscription.setSubscriptionService,
    setSubscriptionShowServices: subscription.setSubscriptionShowServices,
    setSubscriptionPaymentMethod: subscription.setSubscriptionPaymentMethod,
    setSubscriptionCashAmount: subscription.setSubscriptionCashAmount,
    setSubscriptionTransferAmount: subscription.setSubscriptionTransferAmount,
    setSubscriptionPaid: subscription.setSubscriptionPaid,
    setSubscriptionStartDate: subscription.setSubscriptionStartDate,
    setSubscriptionDiscountPercent: subscription.setSubscriptionDiscountPercent,
    setSubscriptionDiscountUsd: subscription.setSubscriptionDiscountUsd,
    
    reloadClients: clients.reloadClients,
    handleQtyChange,
    handleDiscountChange,
    handleTaxChange,
    handleClear,
    handleCheckout: sales.handleCheckout,
    handleCashChange: sales.handleCashChange,
    handleTransferChange: sales.handleTransferChange,
    handleAddFromSearch,
    handleSelectSaleClient: sales.handleSelectSaleClient,
    handleConsumerFinal: sales.handleConsumerFinal,
    handleCloseModal: sales.handleCloseModal,
    handleOpenSubscriptionModal: subscription.handleOpenSubscriptionModal,
    handleCloseSubscriptionModal: subscription.handleCloseSubscriptionModal,
    handleSelectSubscriptionClient: subscription.handleSelectSubscriptionClient,
    handleClearSubscriptionClient: clients.clearSubscriptionClient,
    handleSelectService: subscription.handleSelectService,
    handleSubscriptionDiscountPercent: subscription.handleSubscriptionDiscountPercent,
    handleSubscriptionDiscountUsd: subscription.handleSubscriptionDiscountUsd,
    handleSubscriptionCashChange: subscription.handleSubscriptionCashChange,
    handleSubscriptionTransferChange: subscription.handleSubscriptionTransferChange,
    handleRegisterSubscription: subscription.handleRegisterSubscription,
    handlePendingSubscription: subscription.handlePendingSubscription,
    handleDeletePending: subscription.handleDeletePending,
    
    items: cart.items,
    addItem: cart.addItem,
    updateQuantity: cart.updateQuantity,
    updateItemDiscount: cart.updateItemDiscount,
    removeItem: cart.removeItem,
    clearCart: cart.clearCart,
    totals: cart.totals,
  };
};
