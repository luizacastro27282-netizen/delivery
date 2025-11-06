import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

interface AdminState {
  isAuthenticated: boolean;
  username: string | null;
  adminId: string | null;
  
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loadStats: () => Promise<any>;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      username: null,
      adminId: null,

      login: async (username: string, password: string) => {
        try {
          const response = await api.post<{
            admin: {
              id: string;
              username: string;
              role: string;
            };
            token: string;
            refreshToken: string;
          }>('/admin/auth/login', { username, password });

          if (response) {
            api.setTokens(response.token, response.refreshToken, true);
            set({
              isAuthenticated: true,
              username: response.admin.username,
              adminId: response.admin.id
            });
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('Erro ao fazer login admin:', error);
          return false;
        }
      },

      logout: async () => {
        try {
          // Backend pode não ter endpoint de logout para admin
          // Mas limpamos tokens localmente
          api.clearTokens();
        } catch (error) {
          console.error('Erro ao fazer logout admin:', error);
        } finally {
          set({ isAuthenticated: false, username: null, adminId: null });
        }
      },

      loadStats: async () => {
        try {
          const response = await api.get<{
            totalProducts: number;
            totalOrders: number;
            pendingOrders: number;
            totalRevenue: number;
            todayRevenue: number;
            todayOrders: number;
            averageTicket: number;
            topProducts: Array<{
              productId: string;
              name: string;
              quantity: number;
              revenue: number;
            }>;
          }>('/admin/stats', {
            requiresAdmin: true
          });

          return response;
        } catch (error) {
          console.error('Erro ao carregar estatísticas:', error);
          throw error;
        }
      }
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        username: state.username,
        adminId: state.adminId
      })
    }
  )
);

