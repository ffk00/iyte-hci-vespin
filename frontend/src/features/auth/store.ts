import { create } from "zustand";

export type AuthUser = {
  id: string;
  email: string | null;
  role: "guest" | "registered";
};

type AuthState = {
  token: string | null;
  currentUser: AuthUser | null;
  setSession: (token: string, user: AuthUser) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  currentUser: null,
  setSession: (token, user) => set({ token, currentUser: user }),
  clearSession: () => set({ token: null, currentUser: null }),
}));
