import type { ClientForm } from "../../types/client.types";

type Action =
  | { type: "SET_ClIENTS"; payload: ClientForm[] }
  | { type: "SEARCH"; payload: string }
  | { type: "FILTER_ACTIVE" }
  | { type: "FILTER_INACTIVE" }
  | { type: "SORT"; payload: keyof ClientForm };

interface State {
  clients: ClientForm[];
  filteredClients: ClientForm[];
  search: string;
  sortField: keyof ClientForm | null;
  sortDirection: "asc" | "desc";
  filterMode: "ACTIVE" | "INACTIVE";
}
export const initialState: State = {
  clients: [],
  filteredClients: [],
  search: "",
  sortField: null,
  sortDirection: "asc",
  filterMode: "ACTIVE",
};

const isActive = (client: ClientForm) => client.memberShipStatus === "ACTIVE";

const sortInactiveDefault = (clients: ClientForm[]) => {
  return [...clients].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : a.id;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : b.id;
    return dateB - dateA;
  });
};

const applyFilters = (
  clients: ClientForm[],
  search: string,
  filterMode: State["filterMode"],
  sortField: State["sortField"],
  sortDirection: State["sortDirection"],
) => {
  const normalized = search.toLowerCase().trim();
  const filteredByMode = clients.filter((client) =>
    filterMode === "ACTIVE" ? isActive(client) : !isActive(client),
  );

  const searched = normalized
    ? filteredByMode.filter((client) =>
        `${client.documentNumber} ${client.firstName} ${client.lastName}`
          .toLowerCase()
          .includes(normalized),
      )
    : filteredByMode;

  if (sortField) {
    const sorted = [...searched].sort((a, b) => {
      const valueA = String(a[sortField]).toLowerCase();
      const valueB = String(b[sortField]).toLocaleLowerCase();
      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "desc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }

  if (filterMode === "INACTIVE") {
    return sortInactiveDefault(searched);
  }

  return searched;
};

export const listClientsReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_ClIENTS": {
      const filteredClients = applyFilters(
        action.payload,
        state.search,
        state.filterMode,
        state.sortField,
        state.sortDirection,
      );
      return {
        ...state,
        clients: action.payload,
        filteredClients,
      };
    }
    case "SEARCH": {
      const filteredClients = applyFilters(
        state.clients,
        action.payload,
        state.filterMode,
        state.sortField,
        state.sortDirection,
      );
      return {
        ...state,
        search: action.payload,
        filteredClients,
      };
    }
    case "FILTER_ACTIVE": {
      const filterMode: State["filterMode"] = "ACTIVE";
      const filteredClients = applyFilters(
        state.clients,
        state.search,
        filterMode,
        state.sortField,
        state.sortDirection,
      );
      return {
        ...state,
        filterMode,
        filteredClients,
      };
    }
    case "FILTER_INACTIVE": {
      const filterMode: State["filterMode"] = "INACTIVE";
      const filteredClients = applyFilters(
        state.clients,
        state.search,
        filterMode,
        state.sortField,
        state.sortDirection,
      );
      return {
        ...state,
        filterMode,
        filteredClients,
      };
    }
    case "SORT": {
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
    }
    default:
      return state;
  }
};
