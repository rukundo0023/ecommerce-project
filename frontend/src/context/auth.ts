import { createContext, useContext } from "react";
import type { AuthResponse, AuthUser } from "../lib/api";

export interface AuthState {
  token: string;
  user: AuthUser;
}

export interface AuthContextValue {
  auth: AuthState | null;
  acceptAuth: (response: AuthResponse) => void;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
