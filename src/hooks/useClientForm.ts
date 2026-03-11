import { useReducer } from "react";
import type { ClientForm } from "../types/client.types";
import { clientReducer, initialState } from "./reducers/client.reducer";

const useClientForm = () => {
  const [state, dispatch] = useReducer(clientReducer, initialState);
  const updateField = <K extends keyof ClientForm>(
    field: K,
    value: ClientForm[K],
  ) => {
    dispatch({
      type: "UPDATE_FIELD",
      field,
      value,
    });
  };
  const resetForm = () => {
    dispatch({ type: "RESET" });
  };
  return {
    form: state,
    updateField,
    resetForm,
  };
};
export default useClientForm;
