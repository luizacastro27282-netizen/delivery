import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order, OrderStatus } from '@/types/order';
import { api } from '@/lib/api';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  createOrder: (orderData: any) => Promise<Order>;
  loadOrders: (filters?: { status?: string; limit?: number; offset?: number }) => Promise<void>;
  loadOrdersByPhone: (phone: string) => Promise<void>;
  getOrderById: (orderId: string) => Promise<Order | undefined>;
  updateOrderStatus: (orderId: string, status: OrderStatus, notes?: string) => Promise<void>;
  setCurrentOrder: (order: Order | null) => void;
  clearOrders: () => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      currentOrder: null,
      loading: false,
      error: null,

      createOrder: async (orderData) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post<{ order: Order }>('/orders', orderData, {
            requiresAuth: true
          });

          if (response?.order) {
            set((state) => ({
              orders: [response.order, ...state.orders],
              currentOrder: response.order,
              loading: false
            }));
            return response.order;
          }
          throw new Error('Resposta inválida da API');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao criar pedido';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      loadOrders: async (filters = {}) => {
        set({ loading: true, error: null });
        try {
          const params = new URLSearchParams();
          if (filters.status) params.append('status', filters.status);
          if (filters.limit) params.append('limit', filters.limit.toString());
          if (filters.offset) params.append('offset', filters.offset.toString());

          const endpoint = `/orders${params.toString() ? `?${params.toString()}` : ''}`;
          const response = await api.get<{ orders: Order[]; total: number }>(endpoint, {
            requiresAuth: true
          });

          set({
            orders: response.orders || [],
            loading: false
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar pedidos';
          set({ error: errorMessage, loading: false });
        }
      },

      loadOrdersByPhone: async (phone: string) => {
        set({ loading: true, error: null });
        try {
          const response = await api.get<{ orders: Order[] }>(`/orders/by-phone?phone=${phone}`);
          
          set({
            orders: response.orders || [],
            loading: false
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar pedidos';
          set({ error: errorMessage, loading: false });
        }
      },

      getOrderById: async (orderId) => {
        try {
          const response = await api.get<{ order: Order }>(`/orders/${orderId}`, {
            requiresAuth: true
          });

          if (response?.order) {
            // Atualiza na lista se já existir
            set((state) => ({
              orders: state.orders.map(o => o.id === orderId ? response.order : o)
            }));
            return response.order;
          }
          return undefined;
        } catch (error) {
          console.error('Erro ao buscar pedido:', error);
          // Fallback para buscar localmente
          return get().orders.find(order => order.id === orderId);
        }
      },

      updateOrderStatus: async (orderId, status, notes) => {
        try {
          const response = await api.put<{ order: Order }>(`/admin/orders/${orderId}/status`, {
            status,
            notes
          }, {
            requiresAdmin: true
          });

          if (response?.order) {
            set((state) => ({
              orders: state.orders.map(order =>
                order.id === orderId ? response.order : order
              ),
              currentOrder:
                state.currentOrder?.id === orderId ? response.order : state.currentOrder
            }));
          }
        } catch (error) {
          console.error('Erro ao atualizar status do pedido:', error);
          throw error;
        }
      },

      setCurrentOrder: (order) => {
        set({ currentOrder: order });
      },

      clearOrders: () => {
        set({ orders: [], currentOrder: null });
      }
    }),
    {
      name: 'pizza-orders-storage',
      partialize: (state) => ({ orders: state.orders, currentOrder: state.currentOrder })
    }
  )
);

