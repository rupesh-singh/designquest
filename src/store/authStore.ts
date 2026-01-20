import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: (User & { solvedCount?: number }) | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: (User & { solvedCount?: number }) | null) => void;
  setLoading: (loading: boolean) => void;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),

      login: async (username, password) => {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });

          const data = await res.json();

          if (!res.ok) {
            return { success: false, error: data.error || 'Login failed' };
          }

          set({ user: data.user, isAuthenticated: true });
          return { success: true };
        } catch (error) {
          return { success: false, error: 'Network error. Please try again.' };
        }
      },

      signup: async (username, password, displayName) => {
        try {
          const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, displayName }),
          });

          const data = await res.json();

          if (!res.ok) {
            return { success: false, error: data.error || 'Signup failed' };
          }

          set({ user: data.user, isAuthenticated: true });
          return { success: true };
        } catch (error) {
          return { success: false, error: 'Network error. Please try again.' };
        }
      },

      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
          console.error('Logout error:', error);
        }
        set({ user: null, isAuthenticated: false });
      },

      refreshUser: async () => {
        try {
          set({ isLoading: true });
          const res = await fetch('/api/auth/me');
          
          if (res.ok) {
            const data = await res.json();
            set({ user: data.user, isAuthenticated: true });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch (error) {
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
