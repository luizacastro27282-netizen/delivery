import { ProductType } from './product';

// Tipos de promoção
export type PromotionType = 
  | 'time_based'      // Baseada em dia/hora
  | 'price_compare'   // Comparação de preços
  | 'coupon'          // Cupom de desconto
  | 'bulk'            // Desconto por quantidade
  | 'category'        // Desconto por categoria
  | 'first_order';    // Primeira compra

// Tipo de desconto
export type DiscountKind = 
  | 'percentage'  // Percentual
  | 'fixed'       // Valor fixo
  | 'freeItem';   // Item grátis

export interface DiscountConfig {
  kind: DiscountKind;
  value: number;
  forEvery?: number;  // Para promoções de quantidade
  payFor?: number;    // Para promoções "leve X pague Y"
}

// Condições de aplicação
export interface PromotionConditions {
  dayOfWeek?: number[];        // 0=Dom, 1=Seg, ..., 6=Sáb
  hourRange?: [number, number]; // [inicio, fim] em horas
  productTypes?: ProductType[];
  productCategory?: string;
  productIds?: string[];
  minSubtotal?: number;
  minQuantity?: number;
}

// Configuração de comparação de preços
export interface PriceComparisonConfig {
  modes: ('directPrice' | 'reconstructedPrice')[];
  rule: 'chooseLowest' | 'chooseHighest';
  reconstructed?: {
    sumComponents: boolean;
    includeAddons: boolean;
  };
}

// Estrutura principal de promoção
export interface Promotion {
  id: string;
  name: string;
  description?: string;
  type: PromotionType;
  enabled: boolean;
  applyOrder: number;  // Prioridade (menor = maior prioridade)
  
  // Condições
  conditions?: PromotionConditions;
  
  // Desconto
  discount?: DiscountConfig;
  
  // Comparação de preços (para type='price_compare')
  comparison?: PriceComparisonConfig;
  
  // Código do cupom (para type='coupon')
  code?: string;
  
  // Pode empilhar com outras promoções?
  stackable: boolean;
  
  // Validade
  validFrom?: string;
  validUntil?: string;
  
  // Valor mínimo
  minSubtotal?: number;
  
  // Limite de uso
  maxUsage?: number;
  currentUsage?: number;
}

// Configurações padrão de comparação
export interface ComparisonDefaults {
  tieBreaker: 'favorCustomer' | 'favorBusiness';
  maxStack: number;
  evaluationSequence: ('promotionPriority' | 'maxDiscountAmount' | 'maxDiscountPercentage')[];
}

// Estrutura do arquivo de promoções
export interface PromotionsConfig {
  promotions: Promotion[];
  comparisonDefaults: ComparisonDefaults;
}

// Resultado da avaliação de promoção
export interface PromotionEvaluation {
  promotion: Promotion;
  applicable: boolean;
  discountAmount: number;
  finalPrice: number;
  reason?: string;
}

// Resultado da comparação de preços
export interface PriceComparisonResult {
  directPrice: number;
  reconstructedPrice?: number;
  chosenPrice: number;
  savings: number;
  reason: string;
  appliedPromotions: Promotion[];
}

