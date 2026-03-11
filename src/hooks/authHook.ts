import type { AuthUser } from "../types/user.types";
interface AuthState {
  user: AuthUser | null;
}
type AuthAction = { type: "LOGIN"; payload: AuthUser } | { type: "LOGOUT" };

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
