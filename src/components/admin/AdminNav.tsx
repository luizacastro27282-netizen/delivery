import { useState } from 'react';
import { Package, ShoppingBag, Settings, BarChart3, Gift, CreditCard, Tag } from 'lucide-react';
import { ProductsManager } from './ProductsManager';
import { OrdersManager } from './OrdersManager';
import { ConfigManager } from './ConfigManager';
import { OrderBumpsManager } from './OrderBumpsManager';
import { PaymentManager } from './PaymentManager';
import { PromotionsManager } from './PromotionsManager';
import { StatsCards } from './StatsCards';

type Tab = 'stats' | 'products' | 'orders' | 'promotions' | 'orderbumps' | 'payments' | 'config';

export const AdminNav = () => {
  const [activeTab, setActiveTab] = useState<Tab>('stats');

  const tabs = [
    { id: 'stats' as Tab, label: 'Estatísticas', icon: BarChart3 },
    { id: 'products' as Tab, label: 'Produtos', icon: Package },
    { id: 'orders' as Tab, label: 'Pedidos', icon: ShoppingBag },
    { id: 'promotions' as Tab, label: 'Promoções', icon: Tag },
    { id: 'orderbumps' as Tab, label: 'Order Bumps', icon: Gift },
    { id: 'payments' as Tab, label: 'Pagamentos', icon: CreditCard },
    { id: 'config' as Tab, label: 'Configurações', icon: Settings }
  ];

  return (
    <>
      {/* Navegação Mobile */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto mb-6">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-2 px-4 py-3 min-w-[100px] transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo */}
      <div>
        {activeTab === 'stats' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4">Estatísticas</h2>
            <StatsCards />
          </div>
        )}
        {activeTab === 'products' && <ProductsManager />}
        {activeTab === 'orders' && <OrdersManager />}
        {activeTab === 'promotions' && <PromotionsManager />}
        {activeTab === 'orderbumps' && <OrderBumpsManager />}
        {activeTab === 'payments' && <PaymentManager />}
        {activeTab === 'config' && <ConfigManager />}
      </div>
    </>
  );
};

