// Tipos base para produtos
export type ProductType = 'pizza' | 'combo' | 'drink' | 'dessert' | 'addon';

export type PizzaSize = 'broto' | 'media' | 'grande' | 'gigante';

export interface BasePrices {
  broto?: number;
  media?: number;
  grande?: number;
  gigante?: number;
}

export interface ComboItem {
  productId: string;
  defaultSize?: PizzaSize;
  qty?: number;
}

export interface Product {
  id: string;
  type: ProductType;
  name: string;
  description?: string;
  images: string[];
  category: string;
  tags?: string[];
  available: boolean;
  
  // Pizza específico
  basePrices?: BasePrices;
  flavors?: string[];
  maxFlavors?: number;
  
  // Combo específico
  items?: ComboItem[];
  basePrice?: number;
  
  // Produto simples (bebida, sobremesa, etc)
  price?: number;
  
  // Extras/Adicionais
  addons?: Addon[];
  
  // Variantes (sabores, bordas, etc)
  variants?: ProductVariant[] | null;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
  available: boolean;
}

// Variantes de produtos
export interface ProductVariant {
  name: string;
  label: string;
  values: Array<{
    value: string;
    label: string;
    description?: string;
    priceModifier: number;
  }>;
}

export interface SelectedVariant {
  variantName: string;
  value: string;
}

// Item do carrinho
export interface CartItem {
  id: string; // ID único do item no carrinho
  product: Product;
  quantity: number;
  
  // Configuração específica de pizza
  selectedSize?: PizzaSize;
  selectedFlavors?: string[];
  
  // Configuração de combo
  comboItems?: ConfiguredComboItem[];
  
  // Adicionais selecionados
  selectedAddons?: Addon[];
  
  // Variante selecionada (para OrderBumps e produtos com variantes)
  selectedVariant?: SelectedVariant;
  
  // Preços calculados
  unitPrice: number;
  totalPrice: number;
  
  // Promoções aplicadas a este item
  appliedPromotions?: AppliedPromotion[];
  
  // Notas especiais
  notes?: string;
}

export interface ConfiguredComboItem {
  productId: string;
  product: Product;
  size?: PizzaSize;
  flavors?: string[];
  quantity: number;
}

export interface AppliedPromotion {
  promotionId: string;
  promotionName: string;
  discount: number;
  type: string;
}

