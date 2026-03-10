import { useEffect, useReducer } from "react";
import {
  listEmployeesReducer,
  initialState,
} from "../reducers/listEmploye.reduce";

import type { User } from "../types/user.types";

export const useEmployees = () => {
  const [state, dispatch] = useReducer(listEmployeesReducer, initialState);

  useEffect(() => {
    const employees: User[] = [
      {
        id: 1,
        username: "dennis",
        password: "1234",
        firstName: "Dennis",
        lastName: "Pinzon",
        documentNumber: "0102030405",
        phone: "099999999",
        email: "dennis@gmail.com",
        address: "Piñas",
        role: "EMPLOYEE",
        createdAt: new Date(),
      },
      {
        id: 2,
        username: "admin",
        password: "987654",
        firstName: "Admin",
        lastName: "Sistema",
        documentNumber: "0000000000",
        role: "ADMIN",
        createdAt: new Date(),
      },
    ];

    dispatch({ type: "SET_EMPLOYEES", payload: employees });
  }, []);

  const searchEmployee = (value: string) => {
    dispatch({ type: "SEARCH", payload: value });
  };

  const sortBy = (field: keyof User) => {
    dispatch({ type: "SORT", payload: field });
  };

  return {
    employees: state.filteredEmployees,
    search: state.search,
    searchEmployee,
    sortField: state.sortField,
    sortDirection: state.sortDirection,
    sortBy,
  };
};
