import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, XCircle, RefreshCw, Filter } from 'lucide-react';
import { useOrderStore } from '@/store/useOrderStore';
import { useAuthStore } from '@/store/useAuthStore';
import { SimpleHeader } from '@/components/layout/SimpleHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';

const statusVariants = {
  pending: { variant: 'warning' as const, label: 'Pendente' },
  confirmed: { variant: 'info' as const, label: 'Confirmado' },
  preparing: { variant: 'info' as const, label: 'Preparando' },
  ready: { variant: 'info' as const, label: 'Pronto' },
  out_delivery: { variant: 'info' as const, label: 'Em entrega' },
  delivered: { variant: 'success' as const, label: 'Entregue' },
  cancelled: { variant: 'danger' as const, label: 'Cancelado' }
};

export const MyOrders = () => {
  const navigate = useNavigate();
  const { orders, loadOrdersByPhone, loading, error } = useOrderStore();
  const { isAuthenticated, user } = useAuthStore();

  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_delivery' | 'delivered' | 'cancelled'
  >('all');

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    // Carrega pedidos reais do backend por telefone
    loadOrdersByPhone(user.phone);
  }, [isAuthenticated, user, navigate, loadOrdersByPhone]);

  if (!isAuthenticated || !user) return null;

  // Filtra pedidos no frontend
  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  const sortedOrders = [...filteredOrders].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      <SimpleHeader title="Meus Pedidos" showBack={false} />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Filtros / Ações */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendentes</option>
              <option value="confirmed">Confirmados</option>
              <option value="preparing">Preparando</option>
              <option value="ready">Prontos</option>
              <option value="out_delivery">Em entrega</option>
              <option value="delivered">Entregues</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (user) {
                loadOrdersByPhone(user.phone);
              }
            }}
          >
            <RefreshCw size={16} className="mr-2" /> Atualizar
          </Button>
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando pedidos...</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Erro ao carregar</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => {
              if (user) {
                loadOrdersByPhone(user.phone);
              }
            }}>Tentar novamente</Button>
          </div>
        )}

        {!loading && !error && sortedOrders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Nenhum pedido ainda</h2>
            <p className="text-gray-600 mb-6">Faça seu primeiro pedido agora!</p>
            <Button onClick={() => navigate('/')}>Ver Cardápio</Button>
          </div>
        ) : null}

        {!loading && !error && sortedOrders.length > 0 && (
          <div className="space-y-4">
            {sortedOrders.map((order, index) => {
              const statusConfig = statusVariants[order.status];
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/order/${order.id}`)}
                >
                  <div className="p-6">
                    {/* Header do pedido */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg">Pedido #{order.orderNumber}</h3>
                          <Badge variant={statusConfig.variant}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {formatRelativeTime(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-600">
                          {formatCurrency(order.total)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} itens
                        </p>
                      </div>
                    </div>

                    {/* Itens */}
                    <div className="space-y-2 mb-4">
                      {order.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {item.quantity}x {item.product.name}
                            {item.selectedSize && (
                              <span className="text-gray-500 capitalize"> ({item.selectedSize})</span>
                            )}
                            {item.selectedVariant && item.product.variants && (() => {
                              const variant = item.product.variants.find(v => v.name === item.selectedVariant?.variantName);
                              const option = variant?.values.find(v => v.value === item.selectedVariant?.value);
                              if (variant && option) {
                                return <span className="text-gray-500"> • {variant.label}: {option.label}</span>;
                              }
                              return null;
                            })()}
                          </span>
                          <span className="text-gray-600">
                            {formatCurrency(item.totalPrice)}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-sm text-gray-500">
                          +{order.items.length - 2} {order.items.length - 2 === 1 ? 'item' : 'itens'}
                        </p>
                      )}
                    </div>

                    {/* Promoções aplicadas */}
                    {order.discount > 0 && (
                      <div className="mb-4 p-2 bg-green-50 rounded border border-green-200">
                        <p className="text-sm text-green-700">
                          💰 Economizou {formatCurrency(order.discount)} em promoções
                        </p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {order.status === 'delivered' && (
                          <>
                            <CheckCircle size={16} className="text-green-600" />
                            <span>Pedido entregue</span>
                          </>
                        )}
                        {order.status === 'cancelled' && (
                          <>
                            <XCircle size={16} className="text-red-600" />
                            <span>Pedido cancelado</span>
                          </>
                        )}
                        {!['delivered', 'cancelled'].includes(order.status) && (
                          <>
                            <Clock size={16} className="text-blue-600" />
                            <span>Em andamento</span>
                          </>
                        )}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/order/${order.id}`);
                        }}
                      >
                        Ver detalhes
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

