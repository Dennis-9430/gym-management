import { useCallback, useReducer } from "react";
import type { ClientForm } from "../types/client.types";
import { clientReducer, initialState } from "./reducers/client.reducer";

const useClientForm = () => {
  const [state, dispatch] = useReducer(clientReducer, initialState);
  const updateField = useCallback(
    <K extends keyof ClientForm>(field: K, value: ClientForm[K]) => {
      dispatch({
        type: "UPDATE_FIELD",
        field,
        value,
      });
    },
    [],
  );
  const resetForm = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);
  return {
    form: state,
    updateField,
    resetForm,
  };
};
export default useClientForm;
