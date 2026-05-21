import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import type { User } from "@/api/generated/schemas";

const AUTH_TOKEN_KEY = "vespin.auth.token";

export type AuthUser = User;

type AuthState = {
  token: string | null;
  currentUser: AuthUser | null;
  isHydrated: boolean;
  hydrateSession: () => Promise<void>;
  setSession: (token: string, user: AuthUser) => Promise<void>;
  setCurrentUser: (user: AuthUser | null) => void;
  clearSession: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  currentUser: null,
  isHydrated: false,
  hydrateSession: async () => {
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    set({ token, isHydrated: true });
  },
  setSession: async (token, user) => {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    set({ token, currentUser: user, isHydrated: true });
  },
  setCurrentUser: (user) => set({ currentUser: user }),
  clearSession: async () => {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    set({ token: null, currentUser: null, isHydrated: true });
  },
}));
