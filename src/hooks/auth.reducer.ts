import type { User } from "../types/user.types";
interface AuthState {
  user: User | null;
}
type AuthAction = { type: "LOGIN"; payload: User } | { type: "LOGOUT" };

export const authReducer = (
  state: AuthState,
  action: AuthAction,
): AuthState => {
  switch (action.type) {
    case "LOGIN":
      return { user: action.payload };
    case "LOGOUT":
      return { user: null };
    default:
      return state;
  }
};
