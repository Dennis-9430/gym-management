/**
 * usePOSSubscription.ts - Hook para Suscripciones
 * 
 * Gestiona suscripciones de membresías: cliente, servicio, descuento, pago.
 * @author Sistema de Gestión Gimnasio
 * @version 2.0.0
 */

import { useState, useMemo, useCallback, useContext } from "react";
import type { ClientForm } from "../../types/client.types";
import type { Service } from "../../types/payment.types";
import type { PaymentMethod, SaleRecord } from "../../types/sales.types";
import { assignMembership } from "../../services/services.service";
import { round2, clampPercent } from "../../utils/format/number";
import { ToastContext } from "../../context/ToastContext";
import { createSaleAPI } from "../../services/sales.service";
import { useAuth } from "../../context";

// Interfaz de retorno
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

// Hook de suscripciones
export const usePOSSubscription = (
  clients: ClientForm[],
  reloadClients: () => void,
  initialClient?: ClientForm,
): UsePOSSubscriptionReturn => {
  const toast = useContext(ToastContext);
  const { user } = useAuth();
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [subscriptionSearch, setSubscriptionSearch] = useState(initialClient?.documentNumber || "");
  const [subscriptionClient, setSubscriptionClient] = useState<ClientForm | null>(initialClient || null);
  const [subscriptionService, setSubscriptionService] = useState<Service | null>(null);
  const [subscriptionShowServices, setSubscriptionShowServices] = useState(false);
  const [subscriptionPaymentMethod, setSubscriptionPaymentMethod] = useState<PaymentMethod>("CASH");
  const [subscriptionCashAmount, setSubscriptionCashAmount] = useState(0);
  const [subscriptionTransferAmount, setSubscriptionTransferAmount] = useState(0);
  const [subscriptionPaid, setSubscriptionPaid] = useState(0);
  const getLocalDateString = () => {
    const now = new Date();
    return now.getFullYear() + '-' + 
      String(now.getMonth() + 1).padStart(2, '0') + '-' + 
      String(now.getDate()).padStart(2, '0');
  };
  const [subscriptionStartDate, setSubscriptionStartDate] = useState(getLocalDateString());
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

  const handleSubscriptionPaymentMethodChange = useCallback((value: PaymentMethod) => {
    const total = subscriptionTotal;
    setSubscriptionPaymentMethod(value);
    if (value === "CASH") {
      setSubscriptionCashAmount(total);
      setSubscriptionTransferAmount(0);
      setSubscriptionPaid(total);
    } else if (value === "TRANSFER") {
      setSubscriptionCashAmount(0);
      setSubscriptionTransferAmount(total);
      setSubscriptionPaid(total);
    } else {
      setSubscriptionCashAmount(total);
      setSubscriptionTransferAmount(0);
      setSubscriptionPaid(0);
    }
  }, [subscriptionTotal]);

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
    setSubscriptionCashAmount(0);
    setSubscriptionTransferAmount(0);
    setSubscriptionPaid(0);
    setSubscriptionStartDate(getLocalDateString());
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

  // Handler: registrar suscripción activa
  const handleRegisterSubscription = useCallback(async () => {
    if (!subscriptionClient) {
      toast?.showToast("Selecciona un cliente.", "error");
      return;
    }
    if (!subscriptionService) {
      toast?.showToast("Selecciona una suscripción.", "error");
      return;
    }
    if (subscriptionPaymentMethod === "MIXED") {
      if (Math.abs(subscriptionPaidValue - subscriptionTotal) > 0.01) {
        toast?.showToast("El efectivo y transferencia debe igualar el total.", "error");
        return;
      }
    } else if (subscriptionPaidValue < subscriptionTotal) {
      toast?.showToast("El monto pagado debe cubrir el total.", "error");
      return;
    }

    const clientData = {
      documentNumber: subscriptionClient.documentNumber || "",
      firstName: subscriptionClient.firstName || "",
      lastName: subscriptionClient.lastName || "",
      email: subscriptionClient.email || "",
      phone: subscriptionClient.phone || "",
      address: subscriptionClient.address || "",
    };

    try {
      await assignMembership(subscriptionClient.id, subscriptionService.id, subscriptionStartDate);

      const saleData: Omit<SaleRecord, "id" | "createdAt"> = {
        items: [{
          key: Date.now().toString(),
          id: subscriptionService.id,
          serviceId: subscriptionService.id,
          name: subscriptionService.name,
          description: subscriptionService.description || "",
          category: "servicio",
          stock: null,
          unitPrice: subscriptionService.price,
          unitDiscount: 0,
          quantity: 1,
          subtotal: subscriptionTotal,
          taxRate: 0,
          source: "MEMBERSHIP",
        }],
        totals: {
          subtotal: subscriptionTotal,
          taxableSubtotal: subscriptionTotal,
          vatSubtotal: 0,
          discountRate: 0,
          discountAmount: subscriptionDiscountUsd,
          taxRate: 0,
          taxAmount: 0,
          iceAmount: 0,
          total: subscriptionTotal,
        },
        client: clientData,
        payment: {
          method: subscriptionPaymentMethod,
          cashAmount: subscriptionPaymentMethod === "MIXED"
            ? subscriptionCashAmount
            : subscriptionPaymentMethod === "TRANSFER"
              ? 0
              : subscriptionPaidValue,
          transferAmount: subscriptionPaymentMethod === "MIXED"
            ? subscriptionTransferAmount
            : subscriptionPaymentMethod === "CASH"
              ? 0
              : subscriptionPaidValue,
        },
        createdBy: user?.username || "Sistema",
        generateInvoice: true,
        invoiceEmail: clientData.email || null,
      };
      const saleResult = await createSaleAPI(saleData as any);
      if (!saleResult) {
        toast?.showToast("Membresía asignada correctamente, pero hubo un error al generar la factura.", "info");
        reloadClients();
        handleCloseSubscriptionModal();
      } else {
        toast?.showToast("¡Suscripción registrada con éxito! Factura enviada al correo del cliente.", "success");
        reloadClients();
        // Pequeña pausa para que el usuario vea el mensaje de éxito antes de cerrar
        setTimeout(() => handleCloseSubscriptionModal(), 1200);
      }
    } catch (error) {
      toast?.showToast("Error al registrar la membresía.", "error");
    }
  }, [
    subscriptionClient,
    subscriptionService,
    subscriptionPaymentMethod,
    subscriptionPaidValue,
    subscriptionTotal,
    subscriptionStartDate,
    subscriptionCashAmount,
    subscriptionTransferAmount,
    subscriptionDiscountUsd,
    user,
    reloadClients,
    handleCloseSubscriptionModal,
    toast,
  ]);

  // Handler: registrar suscripción pendiente
  const handlePendingSubscription = useCallback(async () => {
    if (!subscriptionClient) {
      toast?.showToast("Selecciona un cliente.", "error");
      return;
    }
    if (!subscriptionService) {
      toast?.showToast("Selecciona una suscripción.", "error");
      return;
    }

    try {
      await assignMembership(subscriptionClient.id, subscriptionService.id, subscriptionStartDate);
      toast?.showToast("¡Suscripción pendiente registrada con éxito!", "success");
      reloadClients();
      handleCloseSubscriptionModal();
    } catch (error) {
      toast?.showToast("Error al registrar la suscripción pendiente.", "error");
    }
  }, [
    subscriptionClient,
    subscriptionService,
    subscriptionStartDate,
    reloadClients,
    handleCloseSubscriptionModal,
    toast,
  ]);

  const handleDeletePending = useCallback((_client: ClientForm) => {
    if (!confirm("¿Deseas eliminar esta suscripción pendiente?")) {
      return;
    }
    // TODO: Implementar endpoint para marcar como cancelada
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
    setSubscriptionPaymentMethod: handleSubscriptionPaymentMethodChange,
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