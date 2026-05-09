/* Hook para gestionar el carrito de compras (POS) */
// Direccion del archivo: src/hooks/useCart.ts
// Relacionado con: SalesPages.tsx, CartTable.tsx, src/types/pos.types.ts

import { useMemo, useState } from "react";
import type { CatalogItem, CartItem, CartTotals } from "../types/pos.types";

// Funciones helper de calculo

/**
 * Redondea valor a 2 decimales
 * @param value - Numero a redondear
 * @returns Numero redondeado
 */
const round2 = (value: number) => Math.round(value * 100) / 100;

/**
 * Limita descuento entre 0 y precio unitario
 * @param unitPrice - Precio unitario
 * @param discount - Descuento a validar
 * @returns Descuento valido
 */
const clampDiscount = (unitPrice: number, discount: number) => {
  if (Number.isNaN(discount) || !Number.isFinite(discount)) {
    return 0;
  }
  return Math.min(Math.max(discount, 0), unitPrice);
};

/**
 * Calcula subtotal de un item
 * @param unitPrice - Precio unitario
 * @param unitDiscount - Descuento unitario
 * @param quantity - Cantidad
 * @returns Subtotal calculado
 */
const calcSubtotal = (
  unitPrice: number,
  unitDiscount: number,
  quantity: number,
) => {
  const discount = clampDiscount(unitPrice, unitDiscount);
  const base = Math.max(unitPrice - discount, 0);
  return round2(base * quantity);
};

// Hook principal

/**
 * Hook para gestionar el carrito de compras
 * @returns Funciones y estado del carrito
 */
export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discountRate, setDiscountRate] = useState(0);
  const [taxRate, setTaxRate] = useState(0.15);

  const addItem = (item: CatalogItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.key === item.key);
      if (existing) {
        return prev.map((i) =>
          i.key === item.key
            ? {
                ...i,
                quantity: i.quantity + 1,
                subtotal: calcSubtotal(
                  i.unitPrice,
                  i.unitDiscount,
                  i.quantity + 1,
                ),
              }
            : i,
        );
      }
      return [
        ...prev,
        {
          key: item.key,
          id: item.id,
          name: item.name,
          description: item.description,
          category: item.category,
          stock: item.stock,
          unitPrice: item.unitPrice,
          unitDiscount: 0,
          quantity: 1,
          subtotal: calcSubtotal(item.unitPrice, 0, 1),
          source: item.source,
          taxRate: item.taxRate ?? 0,
        },
      ];
    });
  };

  const updateQuantity = (key: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.key !== key));
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.key === key
          ? {
              ...i,
              quantity,
              subtotal: calcSubtotal(i.unitPrice, i.unitDiscount, quantity),
            }
          : i,
      ),
    );
  };

  const updateItemDiscount = (key: string, discount: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.key !== key) return i;
        const normalized = clampDiscount(i.unitPrice, discount);
        return {
          ...i,
          unitDiscount: normalized,
          subtotal: calcSubtotal(i.unitPrice, normalized, i.quantity),
        };
      }),
    );
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totals = useMemo<CartTotals>(() => {
    const subtotal = round2(items.reduce((sum, i) => sum + i.subtotal, 0));

    if (items.length === 0) {
      return {
        subtotal: 0,
        taxableSubtotal: 0,
        vatSubtotal: 0,
        discountRate: 0,
        discountAmount: 0,
        taxRate: 0,
        taxAmount: 0,
        iceAmount: 0,
        total: 0,
      };
    }

    // Descuento global distribuido proporcionalmente
    const discountAmount = round2(subtotal * discountRate);
    const discountFactor = subtotal > 0 ? (subtotal - discountAmount) / subtotal : 1;

    // IVA incluido: el PVP ya incluye IVA, calculamos base imponible = PVP / (1 + tasa)
    let taxableBase = 0;
    let taxAmount = 0;

    for (const item of items) {
      const discountedPvp = round2(item.subtotal * discountFactor); // PVP del item tras descuento global
      if (item.taxRate > 0) {
        const rate = item.taxRate / 100;
        const base = round2(discountedPvp / (1 + rate));
        taxableBase += base;
        taxAmount += round2(discountedPvp - base);
      } else {
        taxableBase += discountedPvp;
      }
    }

    taxableBase = round2(taxableBase);
    taxAmount = round2(taxAmount);
    const iceAmount = 0;
    const total = round2(subtotal - discountAmount); // PVP con IVA incluido - descuento

    return {
      subtotal,
      taxableSubtotal: taxableBase,
      vatSubtotal: taxableBase,
      discountRate,
      discountAmount,
      taxRate,
      taxAmount,
      iceAmount,
      total,
    };
  }, [items, discountRate, taxRate]);

  return {
    items,
    addItem,
    updateQuantity,
    updateItemDiscount,
    removeItem,
    clearCart,
    discountRate,
    setDiscountRate,
    taxRate,
    setTaxRate,
    totals,
  };
};
