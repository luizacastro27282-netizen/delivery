import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types/product';

interface CartState {
  items: CartItem[];
  appliedCoupon?: string;
  couponDiscountAmount?: number;
  
  // Actions
  addItem: (item: Omit<CartItem, 'id' | 'totalPrice'>) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => void;
  setCouponDiscount: (amount: number) => void;
  removeCoupon: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: undefined,
      couponDiscountAmount: 0,

      addItem: (item) => {
        const newItem: CartItem = {
          ...item,
          id: `${item.product.id}-${Date.now()}-${Math.random()}`,
          totalPrice: item.unitPrice * item.quantity
        };

        set((state) => ({
          items: [...state.items, newItem]
        }));
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== itemId)
        }));
      },

      updateItemQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set((state) => ({
          items: state.items.map(item =>
            item.id === itemId
              ? { ...item, quantity, totalPrice: item.unitPrice * quantity }
              : item
          )
        }));
      },

      clearCart: () => {
        set({ items: [], appliedCoupon: undefined, couponDiscountAmount: 0 });
      },

      applyCoupon: (code) => {
        set({ appliedCoupon: code.toUpperCase() });
      },

      setCouponDiscount: (amount) => {
        set({ couponDiscountAmount: Math.max(0, amount || 0) });
      },

      removeCoupon: () => {
        set({ appliedCoupon: undefined, couponDiscountAmount: 0 });
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.totalPrice, 0);
      }
    }),
    {
      name: 'pizza-cart-storage',
      partialize: (state) => ({
        items: state.items,
        appliedCoupon: state.appliedCoupon,
        couponDiscountAmount: state.couponDiscountAmount
      })
    }
  )
);

