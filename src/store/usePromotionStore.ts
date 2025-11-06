import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Promotion, PromotionsConfig } from '@/types/promotion';
import { PromotionEngine } from '@/lib/promotionEngine';
import { api } from '@/lib/api';

interface PromotionState {
  promotions: Promotion[];
  engine: PromotionEngine | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadPromotions: () => Promise<void>;
  getActivePromotions: () => Promotion[];
  validateCoupon: (code: string, subtotal: number) => Promise<{ valid: boolean; promotion?: Promotion; reason?: string }>;
}

export const usePromotionStore = create<PromotionState>()(
  persist(
    (set, get) => ({
      promotions: [],
      engine: null,
      loading: false,
      error: null,

      loadPromotions: async () => {
        set({ loading: true, error: null });
        
        try {
          // Primeiro tenta carregar do localStorage para criar engine rapidamente
          const savedPromotions = get().promotions;
          if (savedPromotions && savedPromotions.length > 0 && !get().engine) {
            const config: PromotionsConfig = {
              promotions: savedPromotions,
              comparisonDefaults: {
                tieBreaker: 'favorCustomer',
                maxStack: 3,
                evaluationSequence: ['promotionPriority', 'maxDiscountAmount']
              }
            };
            const engine = new PromotionEngine(config);
            set({ engine });
          }

          // Depois tenta atualizar da API
          try {
            const response = await api.get<{ promotions: Promotion[] }>('/promotions', {
              requiresAuth: false
            });
          
            // Cria engine com promoções da API
            const config: PromotionsConfig = {
              promotions: response.promotions || [],
              comparisonDefaults: {
                tieBreaker: 'favorCustomer',
                maxStack: 3,
                evaluationSequence: ['promotionPriority', 'maxDiscountAmount']
              }
            };
            const engine = new PromotionEngine(config);
            
            set({
              promotions: response.promotions || [],
              engine,
              loading: false
            });
            return;
          } catch (apiError) {
            // Se falhar, usa promoções salvas se existirem
            const savedPromotions = get().promotions;
            if (savedPromotions && savedPromotions.length > 0) {
              const config: PromotionsConfig = {
                promotions: savedPromotions,
                comparisonDefaults: {
                  tieBreaker: 'favorCustomer',
                  maxStack: 3,
                  evaluationSequence: ['promotionPriority', 'maxDiscountAmount']
                }
              };
              const engine = new PromotionEngine(config);
              set({ engine, loading: false });
              return;
            }
            throw apiError;
          }
        } catch (error) {
          console.error('Erro ao carregar promoções:', error);
          // Se já tem engine criado, não precisa criar novo
          const { engine } = get();
          if (engine) {
            set({ loading: false });
            return;
          }

          // Fallback para JSON local se API falhar
          try {
            const localResponse = await fetch('/data/promotions.json');
            if (localResponse.ok) {
              const localData: PromotionsConfig = await localResponse.json();
              const config: PromotionsConfig = {
                promotions: localData.promotions || [],
                comparisonDefaults: localData.comparisonDefaults || {
                  tieBreaker: 'favorCustomer',
                  maxStack: 3,
                  evaluationSequence: ['promotionPriority', 'maxDiscountAmount']
                }
              };
              const engine = new PromotionEngine(config);
              set({
                promotions: config.promotions || [],
                engine,
                loading: false
              });
            } else {
              throw error;
            }
          } catch (fallbackError) {
            // Cria engine vazio para evitar erros
            const emptyConfig: PromotionsConfig = {
              promotions: [],
              comparisonDefaults: {
                tieBreaker: 'favorCustomer',
                maxStack: 3,
                evaluationSequence: ['promotionPriority', 'maxDiscountAmount']
              }
            };
            const engine = new PromotionEngine(emptyConfig);
            set({
              promotions: [],
              engine,
              error: error instanceof Error ? error.message : 'Erro desconhecido',
              loading: false
            });
          }
        }
      },

      getActivePromotions: () => {
        try {
          const { engine } = get();
          if (!engine) return [];
          return engine.getActivePromotions() || [];
        } catch (error) {
          console.error('Erro ao obter promoções ativas:', error);
          return [];
        }
      },

      validateCoupon: async (code: string, subtotal: number) => {
        try {
          const response = await api.post<{
            valid: boolean;
            promotion?: {
              id: string;
              name: string;
              discount: {
                type: 'percentage' | 'fixed';
                value: number;
              };
              discountAmount: number;
            };
          }>('/promotions/validate', { code, subtotal }, {
            requiresAuth: false
          });

          if (response.valid && response.promotion) {
            // Converte resposta da API para formato do engine
            const promotion: Promotion = {
              id: response.promotion.id,
              name: response.promotion.name,
              type: 'coupon',
              code,
              discount: {
                kind: (response.promotion.discount as any)?.type === 'percentage' ? 'percentage' as const : 'fixed' as const,
                value: (response.promotion.discount as any)?.value || 0
              },
              enabled: true,
              applyOrder: 1,
              stackable: false
            };

            return { valid: true, promotion };
          }

          return { valid: false, reason: 'Cupom inválido' };
        } catch (error) {
          console.error('Erro ao validar cupom:', error);
          // Fallback para engine local
          const { engine } = get();
          if (engine) {
            return engine.validateCoupon(code, subtotal);
          }
          return { valid: false, reason: 'Erro ao validar cupom' };
        }
      }
    }),
    {
      name: 'pizza-promotions-storage',
      partialize: (state) => ({
        promotions: state.promotions,
        // Engine não pode ser serializado, será recriado no loadPromotions
      })
    }
  )
);

