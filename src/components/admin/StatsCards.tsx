import { useProductStore } from '@/store/useProductStore';
import { useOrderStore } from '@/store/useOrderStore';
import { Package, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const StatsCards = () => {
  const { products } = useProductStore();
  const { orders } = useOrderStore();

  // Calcular estatísticas
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total, 0);
  
  // const activeCarts = items.length > 0 ? 1 : 0; // Simplificado (não utilizado)

  const stats = [
    {
      label: 'Total de Produtos',
      value: totalProducts,
      icon: Package,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      label: 'Pedidos Pendentes',
      value: pendingOrders,
      icon: ShoppingBag,
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      label: 'Receita Total',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: 'bg-green-100 text-green-600'
    },
    {
      label: 'Total de Pedidos',
      value: totalOrders,
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.color}`}>
                <Icon size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <p className="text-xs text-gray-600">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
};

