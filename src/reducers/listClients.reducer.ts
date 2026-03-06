import type { ClientForm } from "../types/client.types";

type Action =
  | { type: "SET_ClIENTS"; payload: ClientForm[] }
  | { type: "SEARCH"; payload: string };

interface State {
  clients: ClientForm[];
  filteredClients: ClientForm[];
  search: string;
}
export const initialState: State = {
  clients: [],
  filteredClients: [],
  search: "",
};

export const listClientsReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_ClIENTS":
      return {
        ...state,
        clients: action.payload,
        filteredClients: action.payload,
      };
    case "SEARCH":
      const search = action.payload.toLowerCase().trim();
      const filtered = state.clients.filter((client) =>
        `${client.documentNumber} ${client.firstName} ${client.lastName}`
          .toLowerCase()
          .trim()
          .includes(search),
      );
      return {
        ...state,
        search: action.payload,
        filteredClients: filtered,
      };
    default:
      return state;
  }
};
