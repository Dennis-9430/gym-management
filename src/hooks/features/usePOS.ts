import { useState, useEffect, useMemo, useCallback } from "react";
import { getClients, updateClient } from "../../services/clients.service";
import { getProducts } from "../../services/products.service";
import { createSale } from "../../services/sales.service";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../context/AuthContext";
import { services } from "../../types/payment.types";
import type { ClientForm } from "../../types/client.types";
import type { CatalogItem } from "../../types/pos.types";
import { PRODUCT_CATEGORY_LABELS } from "../../types/product.types";
import type { PaymentMethod, SaleClientInfo } from "../../types/sales.types";
import type { Service } from "../../types/payment.types";
import { matchesQuery, normalizeDocument } from "../../utils/string/normalize";
import { round2, clampPercent } from "../../utils/format/number";
import { parseDateInput, addDays } from "../../utils/date/date";
import { getMembershipDays } from "../../utils/membership/days";

const defaultClientLabel = "Consumidor final";
const defaultClientDocument = "99999999";

const buildCatalog = (
  products: ReturnType<typeof getProducts>,
): CatalogItem[] => {
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
  // State
  clients: ClientForm[];
  catalog: CatalogItem[];
  search: string;
  filteredCatalog: CatalogItem[];
  pendingClients: ClientForm[];
  
  // Sale state
  saleClientInput: string;
  paymentMethod: PaymentMethod;
  cashAmount: number;
  transferAmount: number;
  voucherCode: string;
  saleModalOpen: boolean;
  saleClientResults: ClientForm[];
  matchedSaleClient: ClientForm | null;
  
  // Subscription state
  subscriptionModalOpen: boolean;
  subscriptionSearch: string;
  subscriptionClient: ClientForm | null;
  subscriptionService: Service | null;
  subscriptionShowServices: boolean;
  subscriptionPaymentMethod: PaymentMethod;
  subscriptionCashAmount: number;
  subscriptionTransferAmount: number;
  subscriptionPaid: number;
  subscriptionStartDate: string;
  subscriptionDiscountPercent: number;
  subscriptionDiscountUsd: number;
  subscriptionResults: ClientForm[];
  subscriptionBase: number;
  subscriptionTotal: number;
  subscriptionPaidValue: number;
  subscriptionChange: number;
  
  // Cart
  discountPercent: number;
  taxPercent: number;
  discountRate: number;
  taxRate: number;
  setDiscountRate: (rate: number) => void;
  setTaxRate: (rate: number) => void;
  
  // Actions
  setSearch: (search: string) => void;
  setSaleClientInput: (value: string) => void;
  setPaymentMethod: (value: PaymentMethod) => void;
  setCashAmount: (value: number) => void;
  setTransferAmount: (value: number) => void;
  setVoucherCode: (value: string) => void;
  setSaleModalOpen: (value: boolean) => void;
  
  setSubscriptionModalOpen: (value: boolean) => void;
  setSubscriptionSearch: (value: string) => void;
  setSubscriptionClient: (client: ClientForm | null) => void;
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
  handleSelectSaleClient: (client: ClientForm) => void;
  handleConsumerFinal: () => void;
  handleCloseModal: () => void;
  handleOpenSubscriptionModal: (client?: ClientForm) => void;
  handleCloseSubscriptionModal: () => void;
  handleSelectSubscriptionClient: (client: ClientForm) => void;
  handleSelectService: (service: Service) => void;
  handleSubscriptionDiscountPercent: (value: number) => void;
  handleSubscriptionDiscountUsd: (value: number) => void;
  handleSubscriptionCashChange: (value: number) => void;
  handleSubscriptionTransferChange: (value: number) => void;
  handleRegisterSubscription: () => void;
  handlePendingSubscription: () => void;
  handleDeletePending: (client: ClientForm) => void;
  
  // Cart
  items: ReturnType<typeof useCart>["items"];
  addItem: ReturnType<typeof useCart>["addItem"];
  updateQuantity: ReturnType<typeof useCart>["updateQuantity"];
  updateItemDiscount: ReturnType<typeof useCart>["updateItemDiscount"];
  removeItem: ReturnType<typeof useCart>["removeItem"];
  clearCart: ReturnType<typeof useCart>["clearCart"];
  totals: ReturnType<typeof useCart>["totals"];
}

export const usePOS = (): UsePOSReturn => {
  const { user } = useAuth();
  const { items, addItem, updateQuantity, updateItemDiscount, removeItem, clearCart, discountRate, setDiscountRate, taxRate, setTaxRate, totals } = useCart();
  
  const [clients, setClients] = useState<ClientForm[]>([]);
  const [search, setSearch] = useState("");
  
  // Sale state
  const [saleClientInput, setSaleClientInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [cashAmount, setCashAmount] = useState(0);
  const [transferAmount, setTransferAmount] = useState(0);
  const [voucherCode, setVoucherCode] = useState("");
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  
  // Subscription state
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [subscriptionSearch, setSubscriptionSearch] = useState("");
  const [subscriptionClient, setSubscriptionClient] = useState<ClientForm | null>(null);
  const [subscriptionService, setSubscriptionService] = useState<Service | null>(null);
  const [subscriptionShowServices, setSubscriptionShowServices] = useState(false);
  const [subscriptionPaymentMethod, setSubscriptionPaymentMethod] = useState<PaymentMethod>("CASH");
  const [subscriptionCashAmount, setSubscriptionCashAmount] = useState(0);
  const [subscriptionTransferAmount, setSubscriptionTransferAmount] = useState(0);
  const [subscriptionPaid, setSubscriptionPaid] = useState(0);
  const [subscriptionStartDate, setSubscriptionStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [subscriptionDiscountPercent, setSubscriptionDiscountPercent] = useState(0);
  const [subscriptionDiscountUsd, setSubscriptionDiscountUsd] = useState(0);

  const reloadClients = useCallback(() => setClients(getClients()), []);

  useEffect(() => {
    setClients(getClients());
  }, []);

  const catalog = useMemo(() => buildCatalog(getProducts()), []);

  const filteredCatalog = useMemo(() => {
    if (!search.trim()) {
      return [];
    }
    return catalog.filter((item) =>
      matchesQuery(`${item.name} ${item.description} ${item.category}`, search),
    );
  }, [catalog, search]);

  const pendingClients = useMemo(
    () => clients.filter((client) => client.memberShipStatus === "NONE"),
    [clients],
  );

  const subscriptionResults = useMemo(() => {
    if (!subscriptionSearch.trim()) {
      return [];
    }
    return clients.filter((client) =>
      matchesQuery(
        `${client.documentNumber} ${client.firstName} ${client.lastName}`,
        subscriptionSearch,
      ),
    );
  }, [clients, subscriptionSearch]);

  const saleClientResults = useMemo(() => {
    if (!saleClientInput.trim()) {
      return [];
    }
    return clients.filter((client) =>
      matchesQuery(
        `${client.documentNumber} ${client.firstName} ${client.lastName}`,
        saleClientInput,
      ),
    );
  }, [clients, saleClientInput]);

  const matchedSaleClient = useMemo(() => {
    const normalized = normalizeDocument(saleClientInput);
    if (!normalized) {
      return null;
    }
    return (
      clients.find(
        (client) => normalizeDocument(client.documentNumber) === normalized,
      ) ?? null
    );
  }, [clients, saleClientInput]);

  useEffect(() => {
    const normalized = normalizeDocument(subscriptionSearch);
    if (!normalized) {
      setSubscriptionClient(null);
      return;
    }
    const match = clients.find(
      (client) => normalizeDocument(client.documentNumber) === normalized,
    );
    if (match) {
      setSubscriptionClient(match);
    } else if (
      subscriptionClient &&
      normalizeDocument(subscriptionClient.documentNumber) !== normalized
    ) {
      setSubscriptionClient(null);
    }
  }, [clients, subscriptionClient, subscriptionSearch]);

  useEffect(() => {
    const total = totals.total;
    if (paymentMethod === "CASH") {
      setCashAmount(total);
      setTransferAmount(0);
      return;
    }
    if (paymentMethod === "TRANSFER") {
      setCashAmount(0);
      setTransferAmount(total);
      return;
    }
    setCashAmount(total);
    setTransferAmount(0);
  }, [paymentMethod, totals.total]);

  const subscriptionBase = subscriptionService?.price ?? 0;
  const subscriptionTotal = round2(
    Math.max(subscriptionBase - subscriptionDiscountUsd, 0),
  );

  const subscriptionPaidValue =
    subscriptionPaymentMethod === "MIXED"
      ? round2(subscriptionCashAmount + subscriptionTransferAmount)
      : subscriptionPaid;
  const subscriptionChange = round2(
    Math.max(subscriptionPaidValue - subscriptionTotal, 0),
  );

  useEffect(() => {
    if (subscriptionPaymentMethod === "CASH") {
      setSubscriptionCashAmount(subscriptionTotal);
      setSubscriptionTransferAmount(0);
      setSubscriptionPaid(subscriptionTotal);
      return;
    }
    if (subscriptionPaymentMethod === "TRANSFER") {
      setSubscriptionCashAmount(0);
      setSubscriptionTransferAmount(subscriptionTotal);
      setSubscriptionPaid(subscriptionTotal);
      return;
    }
    setSubscriptionCashAmount(subscriptionTotal);
    setSubscriptionTransferAmount(0);
  }, [subscriptionPaymentMethod, subscriptionTotal]);

  const handleQtyChange = (key: string, quantity: number) => {
    if (Number.isNaN(quantity) || !Number.isFinite(quantity)) {
      updateQuantity(key, 1);
      return;
    }
    updateQuantity(key, quantity);
  };

  const handleDiscountChange = (value: number) => {
    const percent = clampPercent(value);
    setDiscountRate(percent / 100);
  };

  const handleTaxChange = (value: number) => {
    const percent = clampPercent(value);
    setTaxRate(percent / 100);
  };

  const handleClear = () => {
    if (!items.length) {
      return;
    }
    if (confirm("Deseas limpiar el carrito?")) {
      clearCart();
    }
  };

  const handleCheckout = () => {
    if (!items.length) {
      alert("Agrega productos o membresias al carrito.");
      return;
    }

    if (paymentMethod === "MIXED") {
      const sum = round2(cashAmount + transferAmount);
      if (Math.abs(sum - totals.total) > 0.01) {
        alert("El total de efectivo y transferencia debe igualar el total.");
        return;
      }
    }

    const saleClient: SaleClientInfo = matchedSaleClient
      ? {
          documentNumber: matchedSaleClient.documentNumber,
          documentType: matchedSaleClient.documentType,
          firstName: matchedSaleClient.firstName,
          lastName: matchedSaleClient.lastName,
          email: matchedSaleClient.email,
          phone: matchedSaleClient.phone,
          address: matchedSaleClient.address,
        }
      : {
          documentNumber: saleClientInput.trim() || defaultClientDocument,
          firstName: defaultClientLabel,
        };

    if (confirm("Deseas registrar esta venta?")) {
      createSale({
        items,
        totals,
        client: saleClient,
        payment: {
          method: paymentMethod,
          cashAmount,
          transferAmount,
        },
        voucherCode: voucherCode.trim() || undefined,
        createdBy: user?.username,
      });
      clearCart();
      setSearch("");
      setSaleClientInput("");
      setVoucherCode("");
      setPaymentMethod("CASH");
    }
  };

  const handleCashChange = (value: number) => {
    const total = totals.total;
    const normalized = Math.max(0, Math.min(value, total));
    setCashAmount(round2(normalized));
    setTransferAmount(round2(Math.max(total - normalized, 0)));
  };

  const handleTransferChange = (value: number) => {
    const total = totals.total;
    const normalized = Math.max(0, Math.min(value, total));
    setTransferAmount(round2(normalized));
    setCashAmount(round2(Math.max(total - normalized, 0)));
  };

  const handleAddFromSearch = (item: CatalogItem) => {
    addItem(item);
    setSearch("");
  };

  const handleSelectSaleClient = (client: ClientForm) => {
    setSaleClientInput(client.documentNumber);
  };

  const handleConsumerFinal = () => {
    setSaleClientInput(defaultClientDocument);
  };

  const handleCloseModal = () => {
    if (items.length && !confirm("Deseas cancelar la venta actual?")) {
      return;
    }
    clearCart();
    setSearch("");
    setSaleClientInput("");
    setVoucherCode("");
    setPaymentMethod("CASH");
    setSaleModalOpen(false);
  };

  const handleOpenSubscriptionModal = (client?: ClientForm) => {
    if (client) {
      setSubscriptionClient(client);
      setSubscriptionSearch(client.documentNumber);
    }
    setSubscriptionModalOpen(true);
  };

  const handleCloseSubscriptionModal = () => {
    setSubscriptionModalOpen(false);
    setSubscriptionSearch("");
    setSubscriptionClient(null);
    setSubscriptionService(null);
    setSubscriptionShowServices(false);
    setSubscriptionPaymentMethod("CASH");
    setSubscriptionCashAmount(0);
    setSubscriptionTransferAmount(0);
    setSubscriptionPaid(0);
    setSubscriptionStartDate(new Date().toISOString().slice(0, 10));
    setSubscriptionDiscountPercent(0);
    setSubscriptionDiscountUsd(0);
  };

  const handleSelectSubscriptionClient = (client: ClientForm) => {
    setSubscriptionClient(client);
    setSubscriptionSearch(client.documentNumber);
  };

  const handleSelectService = (service: Service) => {
    setSubscriptionService(service);
    setSubscriptionShowServices(false);
    setSubscriptionDiscountPercent(0);
    setSubscriptionDiscountUsd(0);
  };

  const handleSubscriptionDiscountPercent = (value: number) => {
    const percent = clampPercent(value);
    setSubscriptionDiscountPercent(percent);
    setSubscriptionDiscountUsd(round2((subscriptionBase * percent) / 100));
  };

  const handleSubscriptionDiscountUsd = (value: number) => {
    const normalized = Math.max(0, Math.min(value, subscriptionBase));
    setSubscriptionDiscountUsd(round2(normalized));
    const percent = subscriptionBase
      ? round2((normalized / subscriptionBase) * 100)
      : 0;
    setSubscriptionDiscountPercent(percent);
  };

  const handleSubscriptionCashChange = (value: number) => {
    const normalized = Math.max(0, Math.min(value, subscriptionTotal));
    setSubscriptionCashAmount(round2(normalized));
    setSubscriptionTransferAmount(
      round2(Math.max(subscriptionTotal - normalized, 0)),
    );
  };

  const handleSubscriptionTransferChange = (value: number) => {
    const normalized = Math.max(0, Math.min(value, subscriptionTotal));
    setSubscriptionTransferAmount(round2(normalized));
    setSubscriptionCashAmount(
      round2(Math.max(subscriptionTotal - normalized, 0)),
    );
  };

  const handleRegisterSubscription = () => {
    if (!subscriptionClient) {
      alert("Selecciona un cliente.");
      return;
    }
    if (!subscriptionService) {
      alert("Selecciona una suscripcion.");
      return;
    }
    if (subscriptionPaymentMethod === "MIXED") {
      if (Math.abs(subscriptionPaidValue - subscriptionTotal) > 0.01) {
        alert("El efectivo y transferencia debe igualar el total.");
        return;
      }
    } else if (subscriptionPaidValue < subscriptionTotal) {
      alert("El monto pagado debe cubrir el total.");
      return;
    }

    const startDate = parseDateInput(subscriptionStartDate);
    const days = getMembershipDays(subscriptionService.name);
    const endDate = addDays(startDate, days);

    updateClient(subscriptionClient.id, {
      ...subscriptionClient,
      memberShip: subscriptionService.name,
      memberShipStatus: "ACTIVE",
      memberShipStartDate: startDate,
      memberShipEndDate: endDate,
    });
    reloadClients();
    handleCloseSubscriptionModal();
  };

  const handlePendingSubscription = () => {
    if (!subscriptionClient) {
      alert("Selecciona un cliente.");
      return;
    }
    if (!subscriptionService) {
      alert("Selecciona una suscripcion.");
      return;
    }
    const startDate = parseDateInput(subscriptionStartDate);
    const days = getMembershipDays(subscriptionService.name);
    const endDate = addDays(startDate, days);

    updateClient(subscriptionClient.id, {
      ...subscriptionClient,
      memberShip: subscriptionService.name,
      memberShipStatus: "NONE",
      memberShipStartDate: startDate,
      memberShipEndDate: endDate,
    });
    reloadClients();
    handleCloseSubscriptionModal();
  };

  const handleDeletePending = (client: ClientForm) => {
    if (!confirm("Deseas eliminar esta suscripcion pendiente?")) {
      return;
    }
    updateClient(client.id, {
      ...client,
      memberShipStatus: "EXPIRED",
    });
    reloadClients();
  };

  const discountPercent = Number((discountRate * 100).toFixed(2));
  const taxPercent = Number((taxRate * 100).toFixed(2));

  return {
    clients,
    catalog,
    search,
    filteredCatalog,
    pendingClients,
    saleClientInput,
    paymentMethod,
    cashAmount,
    transferAmount,
    voucherCode,
    saleModalOpen,
    saleClientResults,
    matchedSaleClient,
    subscriptionModalOpen,
    subscriptionSearch,
    subscriptionClient,
    subscriptionService,
    subscriptionShowServices,
    subscriptionPaymentMethod,
    subscriptionCashAmount,
    subscriptionTransferAmount,
    subscriptionPaid,
    subscriptionStartDate,
    subscriptionDiscountPercent,
    subscriptionDiscountUsd,
    subscriptionResults,
    subscriptionBase,
    subscriptionTotal,
    subscriptionPaidValue,
    subscriptionChange,
    discountPercent,
    taxPercent,
    discountRate,
    taxRate,
    setDiscountRate,
    setTaxRate,
    setSearch,
    setSaleClientInput,
    setPaymentMethod,
    setCashAmount,
    setTransferAmount,
    setVoucherCode,
    setSaleModalOpen,
    setSubscriptionModalOpen,
    setSubscriptionSearch,
    setSubscriptionClient,
    setSubscriptionService,
    setSubscriptionShowServices,
    setSubscriptionPaymentMethod,
    setSubscriptionCashAmount,
    setSubscriptionTransferAmount,
    setSubscriptionPaid,
    setSubscriptionStartDate,
    setSubscriptionDiscountPercent,
    setSubscriptionDiscountUsd,
    reloadClients,
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
    handleDeletePending,
    items,
    addItem,
    updateQuantity,
    updateItemDiscount,
    removeItem,
    clearCart,
    totals,
  };
};
