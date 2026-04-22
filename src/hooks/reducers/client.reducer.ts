/* Reducer para estado del formulario de cliente */
import type { ClientForm } from "../../types/client.types";

export type ClientAction =
  | { type: "UPDATE_FIELD"; field: keyof ClientForm; value: ClientForm[keyof ClientForm] }
  | { type: "RESET" }
  | { type: "LOAD_CLIENT"; payload: ClientForm };

/* Estado inicial del formulario de cliente */
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

/* Maneja acciones de actualizacion de campo, reset y carga de cliente */
/* Relacionado con: useClientForm.ts, FormClients.tsx */
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
