import { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { supabase } from "../lib/supabase";

export interface UserProfile {
  fullName: string;
  bio: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isSavingProfile: boolean;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<{ error?: string }>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  isSavingProfile: false,

  initialize: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      set({ session, user: session?.user ?? null, isLoading: false });

      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, user: session?.user ?? null, isLoading: false });
      });
    } catch (error) {
      console.error("Auth initialization error:", error);
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  updateProfile: async ({ fullName, bio }) => {
    set({ isSavingProfile: true });
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: fullName, bio },
      });
      if (error) return { error: error.message };
      set({ user: data.user });
      return {};
    } catch (e: any) {
      return { error: e?.message ?? "Unknown error" };
    } finally {
      set({ isSavingProfile: false });
    }
  },
}));
