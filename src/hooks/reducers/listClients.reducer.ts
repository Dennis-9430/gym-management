import type { ClientForm } from "../../types/client.types";

type Action =
  | { type: "SET_ClIENTS"; payload: ClientForm[] }
  | { type: "SEARCH"; payload: string }
  | { type: "FILTER_ACTIVE" }
  | { type: "SHOW_ALL" }
  | { type: "SORT"; payload: keyof ClientForm };

interface State {
  clients: ClientForm[];
  filteredClients: ClientForm[];
  search: string;
  sortField: keyof ClientForm | null;
  sortDirection: "asc" | "desc";
}
export const initialState: State = {
  clients: [],
  filteredClients: [],
  search: "",
  sortField: null,
  sortDirection: "asc",
};

export const listClientsReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_ClIENTS":
      return {
        ...state,
        clients: action.payload,
        filteredClients: action.payload.filter(
          (client) => client.memberShipStatus === "ACTIVE",
        ),
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
    case "FILTER_ACTIVE":
      return {
        ...state,
        filteredClients: state.clients.filter(
          (client) => client.memberShipStatus === "ACTIVE",
        ),
      };
    case "SHOW_ALL":
      return {
        ...state,
        filteredClients: state.clients,
      };
    case "SORT":
      const field = action.payload;
      const direction =
        state.sortField === field && state.sortDirection === "asc"
          ? "desc"
          : "asc";
      const sorted = [...state.filteredClients].sort((a, b) => {
        const valueA = String(a[field]).toLowerCase();
        const valueB = String(b[field]).toLocaleLowerCase();
        if (valueA < valueB) return direction === "asc" ? -1 : 1;
        if (valueA > valueB) return direction === "desc" ? 1 : -1;
        return 0;
      });
      return {
        ...state,
        filteredClients: sorted,
        sortField: field,
        sortDirection: direction,
      };
    default:
      return state;
  }
};
