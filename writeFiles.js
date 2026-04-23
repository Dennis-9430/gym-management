const fs = require('fs');
const path = require('path');

// Content for usePOS.ts with complete documentation
const usePOSContent = `/**
 * =============================================================================
 * usePOS.ts - Hook Principal del Sistema POS (Point of Sale)
 * =============================================================================
 * Este hook es el componente central que gestiona toda la lógica del sistema
 * de punto de venta del gimnasio. Coordina el carrito de compras, la gestión
 * de clientes, el registro de ventas y la administración de suscripciones.
 * 
 * @description Integración de múltiples subsistemas:
 *   - Carrito de compras (useCart)
 *   - Gestión de clientes (usePOSClients)
 *   - Registro de ventas (usePOSSales)
 *   - Suscripciones de membresía (usePOSSubscription)
 * 
 * @author Sistema de Gestión Gimnasio
 * @version 1.0.0
 * =============================================================================
 */

import { useMemo, useCallback, useEffect, useRef, useState } from "react";
import { getProducts } from "../../services/products.service";
import { services } from "../../types/payment.types";
import type { CatalogItem } from "../../types/pos.types";
import { PRODUCT_CATEGORY_LABELS } from "../../types/product.types";
import type { PaymentMethod } from "../../types/sales.types";
import type { Service } from "../../types/payment.types";
import type { ClientForm } from "../../types/client.types";
import type { Product } from "../../types/product.types";
import { useCart } from "../../hooks/useCart";
import { usePOSClients } from "./usePOSClients";
import { usePOSSales } from "./usePOSSales";
import { usePOSSubscription } from "./usePOSSubscription";
import { matchesQuery } from "../../utils/string/normalize";

/**
 * =============================================================================
 * Función: buildCatalog
 * =============================================================================
 * Construye el catálogo unificado de productos y membresías disponibles
 * para la venta en el sistema POS.
 * 
 * @param products - Array de productos disponibles en el inventario
 * @returns Array de CatalogItem que incluye productos y membresías
 * 
 * @details Combina dos fuentes de datos:
 *   - Productos del inventario (filtrados excluyendo servicios de gym)
 *   - Membresías predefined del sistema de pagos
 * =============================================================================
 */
const buildCatalog = (products: Product[]): CatalogItem[] => {
  // Procesa productos del inventario, excluyendo servicios de gimnasio
  const productItems: CatalogItem[] = products
    .filter((product) => product.category !== "SERVICIOS_GYM")
    .map((product) => ({
      key: \`product-\${product.id}\`,
      id: product.id,
      name: product.name,
      description: product.description,
      category: PRODUCT_CATEGORY_LABELS[product.category],
      unitPrice: product.unitPrice,
      stock: product.quantity,
      source: "PRODUCT",
    }));

  // Procesa membresías/servicios disponibles
  const membershipItems: CatalogItem[] = services.map((service) => ({
    key: \`membership-\${service.id}\`,
    id: service.id,
    name: service.name,
    description: "Servicio del gimnasio",
    category: PRODUCT_CATEGORY_LABELS.SERVICIOS_GYM,
    unitPrice: service.price,
    stock: null,
    source: "MEMBERSHIP",
  }));

  // Combina ambos catálogos
  return [...productItems, ...membershipItems];
};

/**
 * =============================================================================
 * Interfaz: UsePOSReturn
 * =============================================================================
 * Define el tipo de retorno del hook usePOS, conteniendo todos los estados
 * y funciones necesarias para operar el sistema POS.
 * 
 * @sections
 *   - Clientes: Gestión de búsqueda y resultados de clientes
 *   - Catálogo: Catálogo de productos y filtro de búsqueda
 *   - Venta: Estados relacionados con el proceso de venta
 *   - Suscripción: Estados del modal de suscripción
 *   - Impuestos/Descuentos: Tasas configurables
 *   - Handlers: Funciones de manejo de eventos
 *   - Carrito: Métodos y propiedades del carrito
 * =============================================================================
 */

/** Interface que define todos los valores de retorno del hook usePOS */
export interface UsePOSReturn {
  // =============================================================================
  // Sección: Clientes
  // =============================================================================
  /** Lista completa de clientes registrados */
  clients: ReturnType<typeof usePOSClients>["clients"];
  
  /** Resultados filtrados de búsqueda de clientes para venta */
  pendingClients: ReturnType<typeof usePOSClients>["pendingClients"];
  
  // =============================================================================
  // Sección: Catálogo
  // =============================================================================
  /** Catálogo completo de productos y membresías */
  catalog: CatalogItem[];
  
  /** Término de búsqueda para filtrar el catálogo */
  search: ReturnType<typeof usePOSClients>["search"];
  
  /** Catálogo filtrado según el término de búsqueda */
  filteredCatalog: CatalogItem[];

  // =============================================================================
  // Sección: Venta
  // =============================================================================
  /** Input del documento del cliente en la venta */
  saleClientInput: string;
  
  /** Método de pago seleccionado */
  paymentMethod: PaymentMethod;
  
  /** Monto en efectivo recibido */
  cashAmount: number;
  
  /** Monto de transferencia recibido */
  transferAmount: number;
  
  /** Código del voucher (opcional) */
  voucherCode: string;
  
  /** Estado de apertura del modal de venta */
  saleModalOpen: boolean;
  
  /** Resultados de búsqueda de cliente para la venta */
  saleClientResults: ReturnType<typeof usePOSClients>["saleClientResults"];
  
  /** Cliente coincidente encontrado por documento */
  matchedSaleClient: ReturnType<typeof usePOSClients>["matchedSaleClient"];

  // =============================================================================
  // Sección: Suscripción
  // =============================================================================
  /** Estado de apertura del modal de suscripción */
  subscriptionModalOpen: boolean;
  
  /** Búsqueda de cliente en modal de suscripción */
  subscriptionSearch: string;
  
  /** Cliente seleccionado para suscripción */
  subscriptionClient: ReturnType<typeof usePOSClients>["subscriptionClient"];
  
  /** Servicio de membresía seleccionado */
  subscriptionService: Service | null;
  
  /** Flag para mostrar lista de servicios */
  subscriptionShowServices: boolean;
  
  /** Método de pago para suscripción */
  subscriptionPaymentMethod: PaymentMethod;
  
  /** Monto en efectivo para suscripción */
  subscriptionCashAmount: number;
  
  /** Monto de transferencia para suscripción */
  subscriptionTransferAmount: number;
  
  /** Total pagado en suscripción */
  subscriptionPaid: number;
  
  /** Fecha de inicio de membresía */
  subscriptionStartDate: string;
  
  /** Porcentaje de descuento aplicado */
  subscriptionDiscountPercent: number;
  
  /** Descuento en USD aplicado */
  subscriptionDiscountUsd: number;
  
  /** Resultados de búsqueda de cliente */
  subscriptionResults: ReturnType<typeof usePOSSubscription>["subscriptionResults"];
  
  /** Base precio sin descuentos */
  subscriptionBase: number;
  
  /** Total con descuentos aplicados */
  subscriptionTotal: number;
  
  /** Valor efectivamente pagado */
  subscriptionPaidValue: number;
  
  /** Cambio a devolver al cliente */
  subscriptionChange: number;

  // =============================================================================
  // Sección: Impuestos y Descuentos
  // =============================================================================
  /** Porcentaje de descuento actual (0-100) */
  discountPercent: number;
  
  /** Porcentaje de impuesto actu
