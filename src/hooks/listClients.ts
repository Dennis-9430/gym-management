import { useEffect, useReducer } from "react";
import {
  listClientsReducer,
  initialState,
} from "../reducers/listClients.reducer";
import type { ClientForm } from "../types/client.types";

export const useClients = () => {
  const [state, dispatch] = useReducer(listClientsReducer, initialState);
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
        createdAt: new Date("2026-03-05T18:04:18"),
        memberShip: "Mensual",
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
        createdAt: new Date("2026-03-05T18:04:18"),
        memberShip: "Quincenal",
        memberShipStatus: "EXPIRED",
        fingerPrint: true,
      },
    ];
    dispatch({ type: "SET_ClIENTS", payload: clients });
  }, []);
  const searchClient = (value: string) => {
    dispatch({ type: "SEARCH", payload: value });
  };
  return {
    clients: state.filteredClients,
    search: state.search,
    searchClient,
  };
};
