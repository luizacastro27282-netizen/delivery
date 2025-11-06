import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, ApiError } from '@/lib/api';

interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  points: number;
  leadId?: string; // ID do lead para buscar endereços
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (phone: string) => Promise<boolean>;
  register: (phone: string, name: string, email?: string, address?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  loadProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (phone: string) => {
        try {
          const cleanPhone = phone.replace(/\D/g, '');
          
          const response = await api.post<{
            user: User;
            token: string;
            refreshToken: string;
          }>('/auth/login', { phone: cleanPhone });

          if (response) {
            api.setTokens(response.token, response.refreshToken);
            set({ user: response.user, isAuthenticated: true });
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('Erro ao fazer login:', error);
          return false;
        }
      },

      register: async (phone: string, name: string, email?: string, address?: string) => {
        try {
          const cleanPhone = phone.replace(/\D/g, '');
          
          const response = await api.post<{
            user: User;
            token: string;
            refreshToken: string;
          }>('/auth/register', {
            phone: cleanPhone,
            name,
            email,
            address
          });

          if (response) {
            api.setTokens(response.token, response.refreshToken);
            set({ user: response.user, isAuthenticated: true });
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('Erro ao registrar:', error);
          return false;
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout', undefined, { requiresAuth: true });
        } catch (error) {
          console.error('Erro ao fazer logout:', error);
        } finally {
          api.clearTokens();
          set({ user: null, isAuthenticated: false });
        }
      },

      updateUser: async (data) => {
        try {
          const response = await api.put<{ user: User }>('/users/profile', data, {
            requiresAuth: true
          });

          if (response) {
            set((state) => ({
              user: response.user || state.user
            }));
          }
        } catch (error) {
          console.error('Erro ao atualizar perfil:', error);
          throw error;
        }
      },

      loadProfile: async () => {
        try {
          const response = await api.get<{ user: User }>('/users/profile', {
            requiresAuth: true
          });

          if (response) {
            set({ user: response.user, isAuthenticated: true });
          }
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            api.clearTokens();
            set({ user: null, isAuthenticated: false });
          }
        }
      }
    }),
    {
      name: 'pizza-auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
);

