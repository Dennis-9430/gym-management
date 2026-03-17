import { useState, useEffect, useMemo, useCallback } from "react";
import { getClients } from "../../services/clients.service";
import type { ClientForm } from "../../types/client.types";
import { matchesQuery, normalizeDocument } from "../../utils/string/normalize";

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
  subscriptionResults: ClientForm[];
  saleClientInput: string;
  setSaleClientInput: (value: string) => void;
  saleClientResults: ClientForm[];
  matchedSaleClient: ClientForm | null;
  reloadClients: () => void;
}

export const usePOSClients = (initialSubscriptionClient?: ClientForm): UsePOSClientsReturn => {
  const [clients, setClients] = useState<ClientForm[]>([]);
  const [search, setSearch] = useState("");
  
  const [subscriptionSearch, setSubscriptionSearch] = useState(initialSubscriptionClient?.documentNumber || "");
  const [subscriptionClient, setSubscriptionClient] = useState<ClientForm | null>(initialSubscriptionClient || null);
  
  const [saleClientInput, setSaleClientInput] = useState("");

  const reloadClients = useCallback(() => setClients(getClients()), []);

  useEffect(() => {
    setClients(getClients());
  }, []);

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

  return {
    clients,
    search,
    setSearch,
    filteredCatalog: [],
    pendingClients,
    subscriptionSearch,
    setSubscriptionSearch,
    subscriptionClient,
    setSubscriptionClient,
    subscriptionResults,
    saleClientInput,
    setSaleClientInput,
    saleClientResults,
    matchedSaleClient,
    reloadClients,
  };
};
