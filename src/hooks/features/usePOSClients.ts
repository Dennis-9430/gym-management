/**
 * usePOSClients.ts - Hook para Búsqueda de Clientes
 * 
 * Gestiona búsqueda y filtrado de clientes en el POS.
 * @author Sistema de Gestión Gimnasio
 * @version 1.0.0
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import { getClients } from "../../services/clients.service";
import type { ClientForm } from "../../types/client.types";
import { matchesQuery, normalizeDocument } from "../../utils/string/normalize";

// Interfaz de retorno
export interface UsePOSClientsReturn {
  clients: ClientForm[];
  search: string;
  setSearch: (search: string) => void;
  filteredCatalog: never[];
  pendingClients: ClientForm[];
  subscriptionSearch: string;
  setSubscriptionSearch: (value: string) => void;
  subscriptionClient: ClientForm | null;
  setSubscriptionClient: (client: ClientForm | null) => void;
  clearSubscriptionClient: () => void;
  subscriptionResults: ClientForm[];
  saleClientResults: ClientForm[];
  matchedSaleClient: ClientForm | null;
  reloadClients: () => void;
}

// Hook de búsqueda de clientes
export const usePOSClients = (
  initialSubscriptionClient?: ClientForm,
  saleClientInput?: string,
): UsePOSClientsReturn => {
  const [clients, setClients] = useState<ClientForm[]>([]);
  const [search, setSearch] = useState("");

  const [subscriptionSearch, setSubscriptionSearch] = useState(initialSubscriptionClient?.documentNumber || "");
  const [subscriptionClient, setSubscriptionClient] = useState<ClientForm | null>(initialSubscriptionClient || null);

  // Carga clientes desde API
const reloadClients = useCallback(async () => {
    const loadedClients = await getClients();
    setClients(loadedClients);
    return loadedClients;
  }, []);

  useEffect(() => {
    reloadClients();
  }, [reloadClients]);

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
    const input = saleClientInput || "";
    if (!input.trim()) {
      return [];
    }
    return clients.filter((client) =>
      matchesQuery(
        `${client.documentNumber} ${client.firstName} ${client.lastName} ${client.email} ${client.phone} ${client.address}`,
        input,
      ),
    );
  }, [clients, saleClientInput]);

  const matchedSaleClient = useMemo(() => {
    const input = saleClientInput || "";
    const normalized = normalizeDocument(input);
    if (!normalized) {
      return null;
    }
    return (
      clients.find(
        (client) => normalizeDocument(client.documentNumber) === normalized,
      ) ?? null
    );
  }, [clients, saleClientInput]);

  const clearSubscriptionClient = useCallback(() => {
    setSubscriptionSearch("");
    setSubscriptionClient(null);
  }, []);

  const handleSubscriptionSearchChange = useCallback((value: string) => {
    setSubscriptionSearch(value);
    const normalized = normalizeDocument(value);
    if (!normalized) {
      setSubscriptionClient(null);
      return;
    }
    const match = clients.find(
      (client) => normalizeDocument(client.documentNumber) === normalized,
    );
    setSubscriptionClient(match || null);
  }, [clients]);

  return {
    clients,
    search,
    setSearch,
    filteredCatalog: [],
    pendingClients,
    subscriptionSearch,
    setSubscriptionSearch: handleSubscriptionSearchChange,
    subscriptionClient,
    setSubscriptionClient,
    clearSubscriptionClient,
    subscriptionResults,
    saleClientResults,
    matchedSaleClient,
    reloadClients,
  };
};
