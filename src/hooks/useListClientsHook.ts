import { useEffect, useReducer } from "react";
import {
  listClientsReducer,
  initialState,
} from "./reducers/listClients.reducer";
import type { ClientForm } from "../types/client.types";
import { getMembershipStatus } from "../utils/membership";

export const useClients = () => {
  const [state, dispatch] = useReducer(listClientsReducer, initialState);
  const totalClients = state.clients.length;
  const activeClients = state.clients.filter(
    (c) => getMembershipStatus(c.memberShipEndDate) === "ACTIVE",
  ).length;
  useEffect(() => {
    const clients: ClientForm[] = [
      {
        id: 1,
        documentType: "CEDULA",
        documentNumber: "0102030405",
        firstName: "Dennis Fabricio",
        lastName: "Pinzon Ajila",
        phone: "0994566938",
        email: "dennis@gmail.com",
        address: "Barrio la Y",
        emergencyContact: "Emilia Ajila",
        emergencyPhone: "0986367026",
        notes: "No tiene nada enconcreto",
        createdAt: new Date(),
        memberShip: "Mensual",
        memberShipStartDate: new Date("2026-02-08"),
        memberShipEndDate: new Date("2026-03-08"),
        memberShipStatus: "ACTIVE",

        fingerPrint: false,
      },
      {
        id: 2,
        documentType: "CEDULA",
        documentNumber: "0958745632",
        firstName: "Carlos",
        lastName: "Mendoza",
        phone: "0994565438",
        email: "dcarloss@gmail.com",
        address: "Barrio la Y",
        emergencyContact: "Emilia Ajila",
        emergencyPhone: "0986367026",
        notes: "No tiene nada enconcreto",
        createdAt: new Date(),
        memberShip: "Quincenal",
        memberShipStartDate: new Date("2026-03-05"),
        memberShipEndDate: new Date("2026-05-17"),
        memberShipStatus: "EXPIRED",
        fingerPrint: true,
      },
    ];
    dispatch({ type: "SET_ClIENTS", payload: clients });
  }, []);
  const searchClient = (value: string) => {
    dispatch({ type: "SEARCH", payload: value });
  };
  const filterActiver = () => {
    dispatch({ type: "FILTER_ACTIVE" });
  };
  const showAll = () => {
    dispatch({ type: "SHOW_ALL" });
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
  };
};
