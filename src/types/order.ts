import { CartItem } from './product';
import { AppliedPromotion } from './product';

export type OrderStatus = 
  | 'pending'       // Aguardando pagamento
  | 'confirmed'     // Pagamento confirmado
  | 'preparing'     // Em preparação
  | 'ready'         // Pronto para retirada/entrega
  | 'out_delivery'  // Saiu para entrega
  | 'delivered'     // Entregue
  | 'cancelled';    // Cancelado

export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'cash';

export type DeliveryMethod = 'delivery' | 'pickup';

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
}

export interface DeliveryAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  reference?: string;
}

export interface PaymentInfo {
  method: PaymentMethod;
  pixCode?: string;
  pixQrCode?: string;
  transactionId?: string;
  paidAt?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  
  // Cliente (backend retorna diretamente no order)
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string | null;
  userId?: string | null;
  
  // Cliente (formato antigo para compatibilidade)
  customer?: CustomerInfo;
  
  // Itens
  items: CartItem[];
  
  // Entrega
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: DeliveryAddress;
  deliveryFee: number;
  
  // Valores
  subtotal: number;
  discount: number;
  total: number;
  
  // Promoções aplicadas
  appliedPromotions?: AppliedPromotion[];
  appliedCoupon?: string;
  
  // Pagamento (backend retorna separado)
  paymentMethod?: string;
  paymentStatus?: string;
  payment?: any; // Objeto de pagamento completo do backend
  
  // Observações
  notes?: string;
  
  // Estimativa de entrega
  estimatedDeliveryTime?: number; // em minutos
  
  // Histórico de status
  statusHistory?: OrderStatusHistory[];
  
  // Datas adicionais
  paidAt?: string | null;
  deliveredAt?: string | null;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  notes?: string;
}

// Para o resumo do carrinho
export interface CartSummary {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
  appliedPromotions: AppliedPromotion[];
  savings: number;
}

