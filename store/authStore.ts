import { create } from "zustand";
import type { User, Session, PendingIntent } from "@/lib/types/auth";
import { getSession, login, signup, logout as mockLogout, addFunds } from "@/lib/mock/auth";

interface AuthState {
  session: Session | null;
  isAuthenticated: boolean;
  pendingIntent: PendingIntent;
  authDialogOpen: boolean;

  hydrate: () => void;
  signUp: (email: string, username: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  setPendingIntent: (intent: PendingIntent) => void;
  consumePendingIntent: () => PendingIntent;
  openAuthDialog: (intent?: PendingIntent) => void;
  closeAuthDialog: () => void;
  addFunds: (amount: number) => User | null;
  updateBalance: (balance: number) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  isAuthenticated: false,
  pendingIntent: null,
  authDialogOpen: false,

  hydrate: () => {
    const session = getSession();
    set({ session, isAuthenticated: !!session });
  },

  signUp: async (email, username, password) => {
    const result = await signup({ email, username, password });
    if (result.success && result.session) {
      set({ session: result.session, isAuthenticated: true, authDialogOpen: false });
      return null;
    }
    return result.error ?? "Sign up failed";
  },

  signIn: async (email, password) => {
    const result = await login({ email, password });
    if (result.success && result.session) {
      set({ session: result.session, isAuthenticated: true, authDialogOpen: false });
      return null;
    }
    return result.error ?? "Sign in failed";
  },

  signOut: async () => {
    await mockLogout();
    set({ session: null, isAuthenticated: false, pendingIntent: null });
  },

  setPendingIntent: (intent) => set({ pendingIntent: intent }),

  consumePendingIntent: () => {
    const intent = get().pendingIntent;
    set({ pendingIntent: null });
    return intent;
  },

  openAuthDialog: (intent) => {
    set({ authDialogOpen: true, pendingIntent: intent ?? get().pendingIntent });
  },

  closeAuthDialog: () => set({ authDialogOpen: false }),

  addFunds: (amount) => {
    const user = addFunds(amount);
    if (user) {
      const session = get().session;
      if (session) {
        set({ session: { ...session, user } });
      }
    }
    return user;
  },

  updateBalance: (balance) => {
    const session = get().session;
    if (session) {
      set({ session: { ...session, user: { ...session.user, balance } } });
    }
  },
}));
