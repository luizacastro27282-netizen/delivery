import { useCartStore } from '@/store/useCartStore';
import { usePromotionStore } from '@/store/usePromotionStore';
import { useConfigStore } from '@/store/useConfigStore';
import { CartSummary } from '@/types/order';
import { useMemo, useEffect, useState } from 'react';

/**
 * Hook customizado para gerenciar o carrinho com promoções
 */
export const useCart = () => {
  const cartStore = useCartStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Aguardar hidratação do store persistido
  useEffect(() => {
    // Pequeno delay para garantir que o Zustand persist carregou do localStorage
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const cartState = cartStore;
  const {
    items = [],
    appliedCoupon,
    couponDiscountAmount = 0,
    addItem,
    removeItem,
    updateItemQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    getItemCount,
    getSubtotal
  } = cartState;

  // Debug: log quando items mudam
  useEffect(() => {
    if (isHydrated) {
      console.log('Cart hydrated - Items:', items.length, 'Subtotal:', getSubtotal());
    }
  }, [items, isHydrated, getSubtotal]);

  const { engine } = usePromotionStore();
  const { config } = useConfigStore();

  // Calcula o resumo do carrinho com promoções
  const summary: CartSummary = useMemo(() => {
    try {
      // Se ainda não hidratou, retorna valores padrão
      if (!isHydrated) {
        return {
          subtotal: 0,
          discount: 0,
          deliveryFee: 0,
          total: 0,
          itemCount: 0,
          appliedPromotions: [],
          savings: 0
        };
      }

      if (!engine || !items || items.length === 0) {
        return {
          subtotal: 0,
          discount: 0,
          deliveryFee: 0,
          total: 0,
          itemCount: 0,
          appliedPromotions: [],
          savings: 0
        };
      }

      const subtotalValue = items.reduce((sum, item) => {
        if (!item || !item.unitPrice) return sum;
        return sum + (item.unitPrice * (item.quantity || 0));
      }, 0);
      
      // Taxa de entrega: grátis se acima do valor mínimo, senão taxa fixa
      const deliveryFeeBase = config?.store?.taxaEntrega || 5.00;
      const freeDeliveryThreshold = (config as any)?.freeDeliveryAbove || 50.00;
      const deliveryFee = subtotalValue >= freeDeliveryThreshold ? 0 : deliveryFeeBase;
      
      const result = engine.calculateCartTotal(items, deliveryFee, appliedCoupon);

      // Aplica desconto adicional do cupom validado na API, se houver
      const couponDiscount = Math.max(0, couponDiscountAmount || 0);
      const combinedDiscount = (result?.discount || 0) + couponDiscount;
      const totalBeforeClamp = (result?.subtotal || 0) - combinedDiscount + deliveryFee;
      const total = Math.max(0, totalBeforeClamp);

      return {
        subtotal: result?.subtotal || 0,
        discount: combinedDiscount,
        deliveryFee,
        total,
        itemCount: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
        appliedPromotions: result?.itemsWithPromotions?.flatMap(item => item.appliedPromotions || []) || [],
        savings: (result?.totalSavings || 0) + couponDiscount
      };
    } catch (error) {
      console.error('Erro ao calcular resumo do carrinho:', error);
      return {
        subtotal: 0,
        discount: 0,
        deliveryFee: 0,
        total: 0,
        itemCount: 0,
        appliedPromotions: [],
        savings: 0
      };
    }
  }, [items, engine, appliedCoupon, couponDiscountAmount, config, isHydrated]);

  return {
    items: items || [],
    appliedCoupon,
    summary,
    addItem: addItem || (() => {}),
    removeItem: removeItem || (() => {}),
    updateItemQuantity: updateItemQuantity || (() => {}),
    clearCart: clearCart || (() => {}),
    applyCoupon: applyCoupon || (() => {}),
    removeCoupon: removeCoupon || (() => {}),
    itemCount: getItemCount ? getItemCount() : 0,
    subtotal: getSubtotal ? getSubtotal() : 0
  };
};

