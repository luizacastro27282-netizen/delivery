import { useState, useEffect } from 'react';
import { Search, Eye, Package } from 'lucide-react';
import { useOrderStore } from '@/store/useOrderStore';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { Order } from '@/types/order';
import { OrderDetailModal } from './OrderDetailModal';

const statusConfig = {
  pending: { label: 'Pendente', color: 'warning' },
  confirmed: { label: 'Confirmado', color: 'info' },
  preparing: { label: 'Preparando', color: 'info' },
  ready: { label: 'Pronto', color: 'info' },
  out_delivery: { label: 'Em entrega', color: 'info' },
  delivered: { label: 'Entregue', color: 'success' },
  cancelled: { label: 'Cancelado', color: 'danger' }
};

export const OrdersManager = () => {
  const { orders, loadOrders, updateOrderStatus, loading } = useOrderStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadOrders({ limit: 100 });
  }, [loadOrders]);

  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = 
        order.orderNumber.includes(searchTerm) ||
        (order.customerName || order.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customerPhone || order.customer?.phone || '').includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    updateOrderStatus(orderId, newStatus);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Pesquisar por pedido, cliente ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Filtros de Status */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-full text-sm ${
              statusFilter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          {Object.entries(statusConfig).map(([status, config]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-full text-sm ${
                statusFilter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando pedidos...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Package size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Nenhum pedido encontrado</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const status = statusConfig[order.status];
            return (
              <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        Pedido #{order.orderNumber}
                      </h3>
                      <Badge variant={status.color as any}>{status.label}</Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                      <p><strong>Cliente:</strong> {order.customerName || order.customer?.name || 'N/A'}</p>
                      <p><strong>Telefone:</strong> {order.customerPhone || order.customer?.phone || 'N/A'}</p>
                      <p><strong>Total:</strong> {formatCurrency(order.total)}</p>
                      <p><strong>Data:</strong> {formatRelativeTime(order.createdAt)}</p>
                    </div>

                    {/* Controle de Status */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600">Status:</label>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        {Object.entries(statusConfig).map(([status, config]) => (
                          <option key={status} value={status}>
                            {config.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-primary-600 hover:text-primary-700 p-2"
                  >
                    <Eye size={20} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

