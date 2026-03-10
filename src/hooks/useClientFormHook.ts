import { useReducer } from "react";
import { clientReducer, initialState } from "../reducers/client.reducer";
import type { ClientForm } from "../types/client.types";

const useClientForm = () => {
  const [form, dispatch] = useReducer(clientReducer, initialState);

  const updateField = (field: keyof ClientForm, value: string) => {
    dispatch({
      type: "UPDATE_FIELD",
      field,
      value,
    });
  };

  const loadClient = (client: ClientForm) => {
    dispatch({
      type: "LOAD_CLIENT",
      payload: client,
    });
  };

  const resetForm = () => {
    dispatch({ type: "RESET" });
  };

  return {
    form,
    updateField,
    loadClient,
    resetForm,
  };
};

export default useClientForm;
