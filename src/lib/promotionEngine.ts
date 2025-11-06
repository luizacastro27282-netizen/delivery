import { 
  Promotion, 
  PromotionEvaluation, 
  PriceComparisonResult,
  ComparisonDefaults,
  PromotionsConfig 
} from '@/types/promotion';
import { CartItem } from '@/types/product';

/**
 * Engine de promoções - calcula e aplica promoções de forma inteligente
 */
export class PromotionEngine {
  private promotions: Promotion[];
  private defaults: ComparisonDefaults;

  constructor(config: PromotionsConfig) {
    this.promotions = (config.promotions || [])
      .filter(p => p && (p.enabled !== false))
      .sort((a, b) => (a.applyOrder || 999) - (b.applyOrder || 999));
    this.defaults = config.comparisonDefaults || {
      tieBreaker: 'favorCustomer',
      maxStack: 3,
      evaluationSequence: ['promotionPriority', 'maxDiscountAmount']
    };
  }

  /**
   * Avalia se uma promoção se aplica a um item do carrinho
   */
  private isPromotionApplicable(
    promotion: Promotion, 
    item: CartItem, 
    subtotal: number,
    appliedCoupon?: string
  ): boolean {
    // Verifica validade de data
    if (promotion.validFrom && new Date(promotion.validFrom) > new Date()) {
      return false;
    }
    if (promotion.validUntil && new Date(promotion.validUntil) < new Date()) {
      return false;
    }

    // Verifica limite de uso
    if (promotion.maxUsage && promotion.currentUsage && 
        promotion.currentUsage >= promotion.maxUsage) {
      return false;
    }

    // Verifica condições específicas
    const conditions = promotion.conditions;
    if (!conditions) return true;

    // Dia da semana
    if (conditions.dayOfWeek && conditions.dayOfWeek.length > 0) {
      const today = new Date().getDay();
      if (!conditions.dayOfWeek.includes(today)) {
        return false;
      }
    }

    // Horário
    if (conditions.hourRange) {
      const hour = new Date().getHours();
      const [start, end] = conditions.hourRange;
      if (hour < start || hour >= end) {
        return false;
      }
    }

    // Tipo de produto
    if (conditions.productTypes && conditions.productTypes.length > 0) {
      if (!conditions.productTypes.includes(item.product.type)) {
        return false;
      }
    }

    // Categoria
    if (conditions.productCategory) {
      if (item.product.category !== conditions.productCategory) {
        return false;
      }
    }

    // IDs específicos
    if (conditions.productIds && conditions.productIds.length > 0) {
      if (!conditions.productIds.includes(item.product.id)) {
        return false;
      }
    }

    // Quantidade mínima
    if (conditions.minQuantity && item.quantity < conditions.minQuantity) {
      return false;
    }

    // Valor mínimo (do carrinho)
    if (conditions.minSubtotal && subtotal < conditions.minSubtotal) {
      return false;
    }

    // Cupom específico
    if (promotion.type === 'coupon') {
      if (!appliedCoupon || appliedCoupon !== promotion.code) {
        return false;
      }
    }

    return true;
  }

  /**
   * Calcula o desconto de uma promoção
   */
  private calculateDiscount(
    promotion: Promotion,
    item: CartItem,
    price: number
  ): number {
    if (!promotion.discount) return 0;

    const { kind, value, forEvery, payFor } = promotion.discount;

    switch (kind) {
      case 'percentage':
        return (price * value) / 100;

      case 'fixed':
        return Math.min(value, price); // Não pode descontar mais que o preço

      case 'freeItem':
        if (forEvery && payFor) {
          // Leve X pague Y
          const groups = Math.floor(item.quantity / forEvery);
          const freeItems = groups * (forEvery - payFor);
          const unitPrice = price / item.quantity;
          return freeItems * unitPrice;
        }
        return 0;

      default:
        return 0;
    }
  }

  /**
   * Calcula o preço reconstruído de um combo
   */
  private calculateReconstructedPrice(item: CartItem): number {
    if (!item.comboItems || item.comboItems.length === 0) {
      return item.unitPrice;
    }

    let total = 0;

    for (const comboItem of item.comboItems) {
      const product = comboItem.product;
      let itemPrice = 0;

      // Pizza - usa o preço do tamanho
      if (product.type === 'pizza' && comboItem.size && product.basePrices) {
        itemPrice = product.basePrices[comboItem.size] || 0;
      }
      // Produto simples
      else if (product.price) {
        itemPrice = product.price;
      }
      // Combo aninhado (raro, mas possível)
      else if (product.basePrice) {
        itemPrice = product.basePrice;
      }

      total += itemPrice * (comboItem.quantity || 1);
    }

    // Adiciona adicionais se configurado
    if (item.selectedAddons && item.selectedAddons.length > 0) {
      const addonsTotal = item.selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
      total += addonsTotal;
    }

    return total * item.quantity;
  }

  /**
   * Compara preços direto vs reconstruído e escolhe o melhor
   */
  comparePrices(item: CartItem): PriceComparisonResult {
    const directPrice = item.totalPrice;
    let reconstructedPrice: number | undefined;
    let chosenPrice = directPrice;
    let savings = 0;
    let reason = 'Usando preço direto do produto';

    // Se for combo, calcula preço reconstruído
    if (item.product.type === 'combo' && item.comboItems) {
      reconstructedPrice = this.calculateReconstructedPrice(item);

      // Escolhe o menor preço
      if (reconstructedPrice < directPrice) {
        chosenPrice = reconstructedPrice;
        savings = directPrice - reconstructedPrice;
        reason = `Preço reconstruído é menor. Economia de R$ ${savings.toFixed(2)}`;
      } else {
        reason = 'Preço do combo é mais vantajoso';
      }
    }

    return {
      directPrice,
      reconstructedPrice,
      chosenPrice,
      savings,
      reason,
      appliedPromotions: []
    };
  }

  /**
   * Avalia todas as promoções para um item
   */
  evaluatePromotionsForItem(
    item: CartItem, 
    subtotal: number,
    appliedCoupon?: string
  ): PromotionEvaluation[] {
    const evaluations: PromotionEvaluation[] = [];

    // Primeiro, verifica comparação de preços
    const priceComparison = this.comparePrices(item);
    const basePrice = priceComparison.chosenPrice;

    for (const promotion of this.promotions) {
      const applicable = this.isPromotionApplicable(promotion, item, subtotal, appliedCoupon);
      
      if (!applicable) {
        evaluations.push({
          promotion,
          applicable: false,
          discountAmount: 0,
          finalPrice: basePrice,
          reason: 'Promoção não aplicável'
        });
        continue;
      }

      // Calcula desconto
      const discountAmount = this.calculateDiscount(promotion, item, basePrice);
      const finalPrice = Math.max(0, basePrice - discountAmount);

      evaluations.push({
        promotion,
        applicable: true,
        discountAmount,
        finalPrice,
        reason: `Desconto de R$ ${discountAmount.toFixed(2)}`
      });
    }

    return evaluations;
  }

  /**
   * Escolhe a melhor combinação de promoções para um item
   */
  chooseBestPromotions(
    evaluations: PromotionEvaluation[]
  ): PromotionEvaluation[] {
    const applicable = evaluations.filter(e => e.applicable);
    
    if (applicable.length === 0) return [];

    // Separa stackable e non-stackable
    const stackable = applicable.filter(e => e.promotion.stackable);
    const nonStackable = applicable.filter(e => !e.promotion.stackable);

    // Se tem promoções não empilháveis, escolhe a melhor
    if (nonStackable.length > 0) {
      // Ordena por desconto (maior primeiro)
      const sorted = [...nonStackable].sort((a, b) => 
        b.discountAmount - a.discountAmount
      );
      return [sorted[0]];
    }

    // Se só tem empilháveis, limita pelo maxStack
    if (stackable.length > 0) {
      const sorted = [...stackable].sort((a, b) => 
        b.discountAmount - a.discountAmount
      );
      return sorted.slice(0, this.defaults.maxStack);
    }

    return [];
  }

  /**
   * Calcula o total do carrinho com promoções aplicadas
   */
  calculateCartTotal(
    items: CartItem[],
    deliveryFee: number = 0,
    appliedCoupon?: string
  ): {
    subtotal: number;
    discount: number;
    total: number;
    itemsWithPromotions: CartItem[];
    totalSavings: number;
  } {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalSavings = 0;
    const itemsWithPromotions: CartItem[] = [];

    // Calcula subtotal inicial
    for (const item of items) {
      const priceComparison = this.comparePrices(item);
      subtotal += priceComparison.chosenPrice;
      totalSavings += priceComparison.savings;
    }

    // Avalia promoções para cada item
    for (const item of items) {
      const priceComparison = this.comparePrices(item);
      const evaluations = this.evaluatePromotionsForItem(item, subtotal, appliedCoupon);
      const bestPromotions = this.chooseBestPromotions(evaluations);

      // Calcula desconto total do item
      const itemDiscount = bestPromotions.reduce((sum, e) => sum + e.discountAmount, 0);
      totalDiscount += itemDiscount;
      totalSavings += itemDiscount;

      // Atualiza item com promoções aplicadas
      const updatedItem: CartItem = {
        ...item,
        totalPrice: priceComparison.chosenPrice - itemDiscount,
        appliedPromotions: bestPromotions.map(e => ({
          promotionId: e.promotion.id,
          promotionName: e.promotion.name,
          discount: e.discountAmount,
          type: e.promotion.type
        }))
      };

      itemsWithPromotions.push(updatedItem);
    }

    const total = Math.max(0, subtotal - totalDiscount + deliveryFee);

    return {
      subtotal,
      discount: totalDiscount,
      total,
      itemsWithPromotions,
      totalSavings
    };
  }

  /**
   * Valida um código de cupom
   */
  validateCoupon(code: string, subtotal: number): {
    valid: boolean;
    promotion?: Promotion;
    reason?: string;
  } {
    const couponPromo = this.promotions.find(
      p => p.type === 'coupon' && p.code?.toUpperCase() === code.toUpperCase()
    );

    if (!couponPromo) {
      return { valid: false, reason: 'Cupom não encontrado' };
    }

    if (!couponPromo.enabled) {
      return { valid: false, reason: 'Cupom desativado' };
    }

    if (couponPromo.validFrom && new Date(couponPromo.validFrom) > new Date()) {
      return { valid: false, reason: 'Cupom ainda não está válido' };
    }

    if (couponPromo.validUntil && new Date(couponPromo.validUntil) < new Date()) {
      return { valid: false, reason: 'Cupom expirado' };
    }

    if (couponPromo.minSubtotal && subtotal < couponPromo.minSubtotal) {
      return { 
        valid: false, 
        reason: `Valor mínimo de R$ ${couponPromo.minSubtotal.toFixed(2)} não atingido` 
      };
    }

    if (couponPromo.maxUsage && couponPromo.currentUsage && 
        couponPromo.currentUsage >= couponPromo.maxUsage) {
      return { valid: false, reason: 'Cupom esgotado' };
    }

    return { valid: true, promotion: couponPromo };
  }

  /**
   * Obtém promoções ativas no momento
   */
  getActivePromotions(): Promotion[] {
    try {
      const now = new Date();
      return this.promotions.filter(p => {
        if (!p || p.enabled === false) return false;
        if (p.validFrom && new Date(p.validFrom) > now) return false;
        if (p.validUntil && new Date(p.validUntil) < now) return false;
        return true;
      });
    } catch (error) {
      console.error('Erro ao obter promoções ativas:', error);
      return [];
    }
  }

  /**
   * Obtém promoções por tipo
   */
  getPromotionsByType(type: string): Promotion[] {
    try {
      return this.promotions.filter(p => p && p.type === type && p.enabled !== false);
    } catch (error) {
      console.error('Erro ao obter promoções por tipo:', error);
      return [];
    }
  }
}

