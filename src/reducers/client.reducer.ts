import type { ClientForm } from "../types/client.types";

export type ClientAction =
  | { type: "UPDATE_FIELD"; field: keyof ClientForm; value: string }
  | { type: "RESET" };
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
  memberShip: "",
  memberShipStatus: "ACTIVE",

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
    case "RESET":
      return initialState;
    default:
      return state;
  }
};
