import { useReducer } from "react";
import { clientReducer, initialState } from "../reducers/client.reducer";

const useClientForm = () => {
  const [state, dispatch] = useReducer(clientReducer, initialState);
  const updateField = (field: string, value: string) => {
    dispatch({
      type: "UPDATE_FIELD",
      field: field as any,
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
