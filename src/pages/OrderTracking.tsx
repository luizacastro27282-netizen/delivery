import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  ChefHat, 
  Truck, 
  Home,
  ArrowLeft,
  Package
} from 'lucide-react';
import { useOrderStore } from '@/store/useOrderStore';
import { OrderStatus } from '@/types/order';
import { PixPayment } from '@/components/payment/PixPayment';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';

const statusConfig: Record<OrderStatus, {
  label: string;
  icon: any;
  color: string;
  bgColor: string;
}> = {
  pending: {
    label: 'Aguardando Pagamento',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100'
  },
  confirmed: {
    label: 'Pagamento Confirmado',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  preparing: {
    label: 'Preparando Pedido',
    icon: ChefHat,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  ready: {
    label: 'Pronto para Entrega',
    icon: Package,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  out_delivery: {
    label: 'Saiu para Entrega',
    icon: Truck,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100'
  },
  delivered: {
    label: 'Entregue',
    icon: Home,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  cancelled: {
    label: 'Cancelado',
    icon: Clock,
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  }
};

export const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, updateOrderStatus, getOrderById } = useOrderStore();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      if (orderId) {
        setLoading(true);
        try {
          const foundOrder = await getOrderById(orderId);
          setOrder(foundOrder || null);
        } catch (error) {
          console.error('Erro ao carregar pedido:', error);
          setOrder(null);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadOrder();
  }, [orderId, orders, getOrderById]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pedido...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Pedido não encontrado</h2>
          <Button onClick={() => navigate('/')}>Voltar ao início</Button>
        </div>
      </div>
    );
  }

  const currentStatus = statusConfig[order.status as OrderStatus] || statusConfig.pending;
  const StatusIcon = currentStatus.icon;

  const handlePaymentConfirmed = () => {
    updateOrderStatus(order.id, 'confirmed');
    // Simula progressão do pedido
    setTimeout(() => updateOrderStatus(order.id, 'preparing'), 2000);
    setTimeout(() => updateOrderStatus(order.id, 'ready'), 5000);
    setTimeout(() => updateOrderStatus(order.id, 'out_delivery'), 8000);
  };

  // Linha do tempo de status
  const statusTimeline: OrderStatus[] = [
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'out_delivery',
    'delivered'
  ];

  const currentStepIndex = statusTimeline.indexOf(order.status);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold">Pedido #{order.orderNumber}</h1>
              <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
            </div>
            <Badge
              variant={
                order.status === 'delivered' ? 'success' :
                order.status === 'cancelled' ? 'danger' :
                order.status === 'pending' ? 'warning' : 'info'
              }
            >
              {currentStatus.label}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conteúdo principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status atual */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${currentStatus.bgColor} rounded-lg p-6 text-center`}
            >
              <StatusIcon className={`${currentStatus.color} w-16 h-16 mx-auto mb-4`} />
              <h2 className={`text-2xl font-bold ${currentStatus.color} mb-2`}>
                {currentStatus.label}
              </h2>
              {order.estimatedDeliveryTime && order.status !== 'delivered' && (
                <p className="text-gray-700">
                  Tempo estimado: {order.estimatedDeliveryTime} minutos
                </p>
              )}
            </motion.div>

            {/* Timeline */}
            {order.status !== 'cancelled' && (
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="font-semibold mb-4">Acompanhamento</h3>
                <div className="space-y-4">
                  {statusTimeline.map((status, index) => {
                    const config = statusConfig[status];
                    const Icon = config.icon;
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const historyEntry = order.statusHistory?.find((h: any) => h.status === status);

                    return (
                      <div key={status} className="flex items-center gap-4">
                        <div
                          className={`
                            w-10 h-10 rounded-full flex items-center justify-center
                            ${isCompleted ? config.bgColor : 'bg-gray-100'}
                            ${isCurrent && 'ring-4 ring-opacity-50 ring-' + config.color}
                          `}
                        >
                          <Icon
                            className={isCompleted ? config.color : 'text-gray-400'}
                            size={20}
                          />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                            {config.label}
                          </p>
                          {isCompleted && historyEntry?.timestamp && (
                            <p className="text-xs text-gray-500">
                              {formatDate(historyEntry.timestamp)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Itens do pedido */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold mb-4">Itens do Pedido</h3>
              <div className="space-y-3">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.quantity}x {item.product.name}</p>
                      {item.selectedSize && (
                        <p className="text-sm text-gray-600 capitalize">
                          Tamanho: {item.selectedSize}
                        </p>
                      )}
                      {item.selectedFlavors && item.selectedFlavors.length > 0 && (
                        <p className="text-sm text-gray-600">
                          Sabores: {item.selectedFlavors.join(', ')}
                        </p>
                      )}
                      {item.selectedVariant && item.product.variants && (
                        <p className="text-sm text-gray-600">
                          {(() => {
                            const variant = item.product.variants.find((v: any) => v.name === item.selectedVariant?.variantName);
                            const option = variant?.values.find((v: any) => v.value === item.selectedVariant?.value);
                            if (variant && option) {
                              return (
                                <>
                                  <span className="font-medium">{variant.label}:</span> {option.label}
                                  {option.description && (
                                    <span className="block text-xs text-gray-500 italic mt-1">
                                      {option.description}
                                    </span>
                                  )}
                                </>
                              );
                            }
                            return `${item.selectedVariant.variantName}: ${item.selectedVariant.value}`;
                          })()}
                        </p>
                      )}
                    </div>
                    <p className="font-semibold">{formatCurrency((item.totalPrice || item.unitPrice) * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Endereço */}
            {order.deliveryAddress && (
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="font-semibold mb-4">Endereço de Entrega</h3>
                <p className="text-gray-700">
                  {order.deliveryAddress.street}, {order.deliveryAddress.number}
                  {order.deliveryAddress.complement && ` - ${order.deliveryAddress.complement}`}
                </p>
                <p className="text-gray-700">
                  {order.deliveryAddress.neighborhood}, {order.deliveryAddress.city}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pagamento PIX */}
            {order.status === 'pending' && order.paymentMethod === 'pix' && order.payment && (
              <PixPayment
                amount={order.total}
                orderId={order.id}
                existingPixCode={order.payment.pixCode}
                existingTransactionId={order.payment.id}
                existingExpiresAt={order.payment.pixExpirationDate}
                onPaymentConfirmed={handlePaymentConfirmed}
              />
            )}

            {/* Resumo */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold mb-4">Resumo do Pedido</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Entrega</span>
                  <span>{formatCurrency(order.deliveryFee)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary-600">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Informações do cliente */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold mb-4">Dados do Cliente</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Nome:</strong> {order.customerName || order.customer?.name || 'N/A'}</p>
                <p><strong>Telefone:</strong> {order.customerPhone || order.customer?.phone || 'N/A'}</p>
                {(order.customerEmail || order.customer?.email) && (
                  <p><strong>E-mail:</strong> {order.customerEmail || order.customer?.email}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

