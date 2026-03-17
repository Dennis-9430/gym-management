import { useState, useEffect, useMemo, useCallback } from "react";
import type { ClientForm } from "../../types/client.types";
import type { Service } from "../../types/payment.types";
import type { PaymentMethod } from "../../types/sales.types";
import { updateClient } from "../../services/clients.service";
import { round2, clampPercent } from "../../utils/format/number";
import { parseDateInput, addDays } from "../../utils/date/date";
import { getMembershipDays } from "../../utils/membership/days";

export interface UsePOSSubscriptionReturn {
  subscriptionModalOpen: boolean;
  setSubscriptionModalOpen: (value: boolean) => void;
  subscriptionSearch: string;
  setSubscriptionSearch: (value: string) => void;
  subscriptionClient: ClientForm | null;
  setSubscriptionClient: (client: ClientForm | null) => void;
  subscriptionService: Service | null;
  setSubscriptionService: (service: Service | null) => void;
  subscriptionShowServices: boolean;
  setSubscriptionShowServices: (value: boolean) => void;
  subscriptionPaymentMethod: PaymentMethod;
  setSubscriptionPaymentMethod: (value: PaymentMethod) => void;
  subscriptionCashAmount: number;
  setSubscriptionCashAmount: (value: number) => void;
  subscriptionTransferAmount: number;
  setSubscriptionTransferAmount: (value: number) => void;
  subscriptionPaid: number;
  setSubscriptionPaid: (value: number) => void;
  subscriptionStartDate: string;
  setSubscriptionStartDate: (value: string) => void;
  subscriptionDiscountPercent: number;
  setSubscriptionDiscountPercent: (value: number) => void;
  subscriptionDiscountUsd: number;
  setSubscriptionDiscountUsd: (value: number) => void;
  subscriptionResults: ClientForm[];
  subscriptionBase: number;
  subscriptionTotal: number;
  subscriptionPaidValue: number;
  subscriptionChange: number;
  reloadClients: () => void;
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
}

export const usePOSSubscription = (
  clients: ClientForm[],
  reloadClients: () => void,
  initialClient?: ClientForm,
): UsePOSSubscriptionReturn => {
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [subscriptionSearch, setSubscriptionSearch] = useState(initialClient?.documentNumber || "");
  const [subscriptionClient, setSubscriptionClient] = useState<ClientForm | null>(initialClient || null);
  const [subscriptionService, setSubscriptionService] = useState<Service | null>(null);
  const [subscriptionShowServices, setSubscriptionShowServices] = useState(false);
  const [subscriptionPaymentMethod, setSubscriptionPaymentMethod] = useState<PaymentMethod>("CASH");
  const [subscriptionCashAmount, setSubscriptionCashAmount] = useState(0);
  const [subscriptionTransferAmount, setSubscriptionTransferAmount] = useState(0);
  const [subscriptionPaid, setSubscriptionPaid] = useState(0);
  const [subscriptionStartDate, setSubscriptionStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [subscriptionDiscountPercent, setSubscriptionDiscountPercent] = useState(0);
  const [subscriptionDiscountUsd, setSubscriptionDiscountUsd] = useState(0);

  const subscriptionResults = useMemo(() => {
    if (!subscriptionSearch.trim()) {
      return [];
    }
    return clients.filter((client) =>
      client.documentNumber.includes(subscriptionSearch) ||
      client.firstName.toLowerCase().includes(subscriptionSearch.toLowerCase()) ||
      client.lastName.toLowerCase().includes(subscriptionSearch.toLowerCase())
    );
  }, [clients, subscriptionSearch]);

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

  const handleOpenSubscriptionModal = useCallback((client?: ClientForm) => {
    if (client) {
      setSubscriptionClient(client);
      setSubscriptionSearch(client.documentNumber);
    }
    setSubscriptionModalOpen(true);
  }, []);

  const handleCloseSubscriptionModal = useCallback(() => {
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
  }, []);

  const handleSelectSubscriptionClient = useCallback((client: ClientForm) => {
    setSubscriptionClient(client);
    setSubscriptionSearch(client.documentNumber);
  }, []);

  const handleSelectService = useCallback((service: Service) => {
    setSubscriptionService(service);
    setSubscriptionShowServices(false);
    setSubscriptionDiscountPercent(0);
    setSubscriptionDiscountUsd(0);
  }, []);

  const handleSubscriptionDiscountPercent = useCallback((value: number) => {
    const percent = clampPercent(value);
    setSubscriptionDiscountPercent(percent);
    setSubscriptionDiscountUsd(round2((subscriptionBase * percent) / 100));
  }, [subscriptionBase]);

  const handleSubscriptionDiscountUsd = useCallback((value: number) => {
    const normalized = Math.max(0, Math.min(value, subscriptionBase));
    setSubscriptionDiscountUsd(round2(normalized));
    const percent = subscriptionBase
      ? round2((normalized / subscriptionBase) * 100)
      : 0;
    setSubscriptionDiscountPercent(percent);
  }, [subscriptionBase]);

  const handleSubscriptionCashChange = useCallback((value: number) => {
    const normalized = Math.max(0, Math.min(value, subscriptionTotal));
    setSubscriptionCashAmount(round2(normalized));
    setSubscriptionTransferAmount(
      round2(Math.max(subscriptionTotal - normalized, 0)),
    );
  }, [subscriptionTotal]);

  const handleSubscriptionTransferChange = useCallback((value: number) => {
    const normalized = Math.max(0, Math.min(value, subscriptionTotal));
    setSubscriptionTransferAmount(round2(normalized));
    setSubscriptionCashAmount(
      round2(Math.max(subscriptionTotal - normalized, 0)),
    );
  }, [subscriptionTotal]);

  const handleRegisterSubscription = useCallback(() => {
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
  }, [
    subscriptionClient,
    subscriptionService,
    subscriptionPaymentMethod,
    subscriptionPaidValue,
    subscriptionTotal,
    subscriptionStartDate,
    reloadClients,
    handleCloseSubscriptionModal,
  ]);

  const handlePendingSubscription = useCallback(() => {
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
  }, [
    subscriptionClient,
    subscriptionService,
    subscriptionStartDate,
    reloadClients,
    handleCloseSubscriptionModal,
  ]);

  const handleDeletePending = useCallback((client: ClientForm) => {
    if (!confirm("Deseas eliminar esta suscripcion pendiente?")) {
      return;
    }
    updateClient(client.id, {
      ...client,
      memberShipStatus: "EXPIRED",
    });
    reloadClients();
  }, [reloadClients]);

  return {
    subscriptionModalOpen,
    setSubscriptionModalOpen,
    subscriptionSearch,
    setSubscriptionSearch,
    subscriptionClient,
    setSubscriptionClient,
    subscriptionService,
    setSubscriptionService,
    subscriptionShowServices,
    setSubscriptionShowServices,
    subscriptionPaymentMethod,
    setSubscriptionPaymentMethod,
    subscriptionCashAmount,
    setSubscriptionCashAmount,
    subscriptionTransferAmount,
    setSubscriptionTransferAmount,
    subscriptionPaid,
    setSubscriptionPaid,
    subscriptionStartDate,
    setSubscriptionStartDate,
    subscriptionDiscountPercent,
    setSubscriptionDiscountPercent,
    subscriptionDiscountUsd,
    setSubscriptionDiscountUsd,
    subscriptionResults,
    subscriptionBase,
    subscriptionTotal,
    subscriptionPaidValue,
    subscriptionChange,
    reloadClients,
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
  };
};
