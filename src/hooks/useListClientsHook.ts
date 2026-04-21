import { useEffect, useReducer } from "react";
import {
  listClientsReducer,
  initialState,
} from "./reducers/listClients.reducer";
import type { ClientForm } from "../types/client.types";
import { getClients } from "../services/clients.service";

/* Hook que maneja el estado de la lista de clientes */
export const useClients = () => {
  const [state, dispatch] = useReducer(listClientsReducer, initialState);
  const totalClients = state.clients.length;
  const activeClients = state.clients.filter(
    (c) => c.memberShipStatus === "ACTIVE",
  ).length;

  const reloadClients = () => {
    const clients: ClientForm[] = getClients();
    dispatch({ type: "SET_ClIENTS", payload: clients });
  };

  useEffect(() => {
    reloadClients();
  }, []);

  const searchClient = (value: string) => {
    dispatch({ type: "SEARCH", payload: value });
  };
  const filterActiver = () => {
    dispatch({ type: "FILTER_ACTIVE" });
  };
  const showAll = () => {
    dispatch({ type: "FILTER_ALL" });
  };

  const sortBy = (field: keyof ClientForm) => {
    dispatch({ type: "SORT", payload: field });
  };
  return {
    clients: state.filteredClients,
    search: state.search,
    searchClient,
    sortField: state.sortField,
    sortDirection: state.sortDirection,
    sortBy,
    showAll,
    filterActiver,
    totalClients,
    activeClients,
    reloadClients,
    filterMode: state.filterMode,
  };
};
