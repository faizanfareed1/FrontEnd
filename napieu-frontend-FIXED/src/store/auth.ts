import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/api';
import type { LoginRequest } from '@/types';

interface AuthState {
  token: string | null;
  username: string | null;
  role: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      username: null,
      role: null,
      isAuthenticated: false,

      login: async (credentials) => {
        const response = await authApi.login(credentials);
        localStorage.setItem('authToken', response.token);
        set({
          token: response.token,
          username: response.username,
          role: response.role,
          isAuthenticated: true,
        });
      },

      logout: () => {
        authApi.logout();
        set({
          token: null,
          username: null,
          role: null,
          isAuthenticated: false,
        });
      },

      checkAuth: () => {
        const state = get();
        return state.isAuthenticated && state.token !== null;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
