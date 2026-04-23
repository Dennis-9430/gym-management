/* Hook para manejar registro de ventas */
import { useState, useCallback } from "react";
import type { CartItem, CartTotals } from "../../types/pos.types";
import type { PaymentMethod, SaleClientInfo } from "../../types/sales.types";
import type { ClientForm } from "../../types/client.types";
import { createSaleAPI } from "../../services/sales.service";
import { useAuth } from "../../context/index.ts";
import { round2 } from "../../utils/format/number";

const defaultClientLabel = "Consumidor final";
const defaultClientDocument = "99999999";

export interface UsePOSSalesReturn {
  saleClientInput: string;
  setSaleClientInput: (value: string) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (value: PaymentMethod) => void;
  cashAmount: number;
  setCashAmount: (value: number) => void;
  transferAmount: number;
  setTransferAmount: (value: number) => void;
  voucherCode: string;
  setVoucherCode: (value: string) => void;
  saleModalOpen: boolean;
  setSaleModalOpen: (value: boolean) => void;
  handleCheckout: () => void;
  handleCashChange: (value: number) => void;
  handleTransferChange: (value: number) => void;
  handleSelectSaleClient: (client: ClientForm | null) => void;
  handleConsumerFinal: () => void;
  handleCloseModal: () => void;
}

export const usePOSSales = (
  totals: CartTotals,
  items: CartItem[],
  clearCart: () => void,
  matchedSaleClient: ClientForm | null,
): UsePOSSalesReturn => {
  const { user } = useAuth();
  
  const [saleClientInput, setSaleClientInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [cashAmount, setCashAmount] = useState(0);
  const [transferAmount, setTransferAmount] = useState(0);
  const [voucherCode, setVoucherCode] = useState("");
  const [saleModalOpen, setSaleModalOpen] = useState(false);

  const handlePaymentMethodChange = useCallback((value: PaymentMethod) => {
    const total = totals.total;
    setPaymentMethod(value);
    if (value === "CASH") {
      setCashAmount(total);
      setTransferAmount(0);
    } else if (value === "TRANSFER") {
      setCashAmount(0);
      setTransferAmount(total);
    } else {
      setCashAmount(total);
      setTransferAmount(0);
    }
  }, [totals.total]);

  const handleCheckout = useCallback(() => {
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
      createSaleAPI({
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
      })
        .then(() => {
          clearCart();
          setSaleClientInput("");
          setVoucherCode("");
          setPaymentMethod("CASH");
        })
        .catch(console.error);
    }
  }, [
    items,
    paymentMethod,
    cashAmount,
    transferAmount,
    totals,
    matchedSaleClient,
    saleClientInput,
    voucherCode,
    user,
    clearCart,
  ]);

  const handleCashChange = useCallback((value: number) => {
    const total = totals.total;
    const normalized = Math.max(0, Math.min(value, total));
    setCashAmount(round2(normalized));
    setTransferAmount(round2(Math.max(total - normalized, 0)));
  }, [totals.total]);

  const handleTransferChange = useCallback((value: number) => {
    const total = totals.total;
    const normalized = Math.max(0, Math.min(value, total));
    setTransferAmount(round2(normalized));
    setCashAmount(round2(Math.max(total - normalized, 0)));
  }, [totals.total]);

  const handleSelectSaleClient = useCallback((client: ClientForm | null) => {
    if (client === null) {
      setSaleClientInput("");
    } else {
      setSaleClientInput(client.documentNumber);
    }
  }, []);

  const handleConsumerFinal = useCallback(() => {
    setSaleClientInput(defaultClientDocument);
  }, []);

  const handleCloseModal = useCallback(() => {
    if (items.length && !confirm("Deseas cancelar la venta actual?")) {
      return;
    }
    clearCart();
    setSaleClientInput("");
    setVoucherCode("");
    setCashAmount(0);
    setTransferAmount(0);
    setSaleModalOpen(false);
  }, [items.length, clearCart]);

  return {
    saleClientInput,
    setSaleClientInput,
    paymentMethod,
    setPaymentMethod: handlePaymentMethodChange,
    cashAmount,
    setCashAmount,
    transferAmount,
    setTransferAmount,
    voucherCode,
    setVoucherCode,
    saleModalOpen,
    setSaleModalOpen,
    handleCheckout,
    handleCashChange,
    handleTransferChange,
    handleSelectSaleClient,
    handleConsumerFinal,
    handleCloseModal,
  };
};
