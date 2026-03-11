import type { User } from "../../types/user.types";

type Action =
  | { type: "SET_EMPLOYEES"; payload: User[] }
  | { type: "SEARCH"; payload: string }
  | { type: "SORT"; payload: keyof User };

interface State {
  employees: User[];
  filteredEmployees: User[];
  search: string;
  sortField: keyof User | null;
  sortDirection: "asc" | "desc";
}

export const initialState: State = {
  employees: [],
  filteredEmployees: [],
  search: "",
  sortField: null,
  sortDirection: "asc",
};

export const listEmployeesReducer = (
  state: State,
  action: Action,
): State => {
  switch (action.type) {
    case "SET_EMPLOYEES":
      return {
        ...state,
        employees: action.payload,
        filteredEmployees: action.payload,
      };

    case "SEARCH":
      const search = action.payload.toLowerCase();

      const filtered = state.employees.filter((emp) =>
        `${emp.documentNumber} ${emp.firstName} ${emp.lastName} ${emp.username}`
          .toLowerCase()
          .includes(search),
      );

      return {
        ...state,
        search: action.payload,
        filteredEmployees: filtered,
      };

    case "SORT":
      const field = action.payload;

      const direction =
        state.sortField === field && state.sortDirection === "asc"
          ? "desc"
          : "asc";

      const sorted = [...state.filteredEmployees].sort((a, b) => {
        const valueA = String(a[field]).toLowerCase();
        const valueB = String(b[field]).toLowerCase();

        if (valueA < valueB) return direction === "asc" ? -1 : 1;
        if (valueA > valueB) return direction === "asc" ? 1 : -1;

        return 0;
      });

      return {
        ...state,
        filteredEmployees: sorted,
        sortField: field,
        sortDirection: direction,
      };

    default:
      return state;
  }
};
