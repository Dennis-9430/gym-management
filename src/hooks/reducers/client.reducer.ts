import type { ClientForm } from "../../types/client.types";

export type ClientAction =
  | { type: "UPDATE_FIELD"; field: keyof ClientForm; value: ClientForm[keyof ClientForm] }
  | { type: "RESET" }
  | { type: "LOAD_CLIENT"; payload: ClientForm };
export const initialState: ClientForm = {
  id: 1,
  documentType: "CEDULA",
  documentNumber: "",

  firstName: "",
  lastName: "",

  phone: "",
  email: "",
  address: "",

  emergencyContact: "",
  emergencyPhone: "",

  notes: "",
  createdAt: new Date(),
  memberShip: "Por registrar",
  memberShipStatus: "NONE",
  memberShipStartDate: new Date(),
  memberShipEndDate: new Date(),

  fingerPrint: false,
};
export const clientReducer = (
  state: ClientForm,
  action: ClientAction,
): ClientForm => {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      };
    case "LOAD_CLIENT":
      return action.payload;
    case "RESET":
      return initialState;

    default:
      return state;
  }
};
