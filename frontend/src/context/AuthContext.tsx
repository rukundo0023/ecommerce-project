import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthResponse, AuthUser } from "../lib/api";
import { AuthContext, type AuthState } from "./auth";
import { useQueryClient } from "@tanstack/react-query";

const STORAGE_KEY = "shopease-auth";

const isAuthUser = (value: unknown): value is AuthUser =>
  typeof value === "object" &&
  value !== null &&
  "id" in value &&
  typeof value.id === "string" &&
  "name" in value &&
  typeof value.name === "string" &&
  "email" in value &&
  typeof value.email === "string" &&
  "role" in value &&
  (value.role === "user" || value.role === "admin");

const readAuth = (): AuthState | null => {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (
      typeof value === "object" &&
      value !== null &&
      "token" in value &&
      typeof value.token === "string" &&
      "user" in value &&
      isAuthUser(value.user)
    ) {
      return { token: value.token, user: value.user };
    }
  } catch {
    return null;
  }
  return null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(readAuth);
  const queryClient = useQueryClient();

  const acceptAuth = useCallback((response: AuthResponse) => {
    const next = { token: response.token, user: response.user };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    void queryClient.removeQueries({ queryKey: ["account"] });
    void queryClient.removeQueries({ queryKey: ["admin"] });
    setAuth(next);
  }, [queryClient]);

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    void queryClient.removeQueries({ queryKey: ["account"] });
    void queryClient.removeQueries({ queryKey: ["admin"] });
    setAuth(null);
  }, [queryClient]);

  useEffect(() => {
    const syncAuth = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setAuth(readAuth());
    };
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  const value = useMemo(() => ({ auth, acceptAuth, signOut }), [auth, acceptAuth, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
