import { Home, Tag, Receipt, User, ShoppingCart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatCurrency } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cart = useCart();
  const itemCount = cart?.itemCount || 0;
  const summary = cart?.summary || { subtotal: 0 };

  const navItems = [
    {
      icon: Home,
      label: 'Início',
      path: '/',
      active: location.pathname === '/'
    },
    {
      icon: Tag,
      label: 'Promoções',
      path: '/promocoes',
      active: location.pathname === '/promocoes'
    },
    {
      icon: Receipt,
      label: 'Pedidos',
      path: '/orders',
      active: location.pathname === '/orders'
    },
    {
      icon: User,
      label: 'Perfil',
      path: '/perfil',
      active: location.pathname === '/perfil'
    }
  ];

  return (
    <>
      {/* Carrinho Fixo - aparece quando há itens */}
      <AnimatePresence>
        {itemCount > 0 && location.pathname === '/' && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 left-4 right-4 z-30 md:hidden mb-2"
          >
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-primary-600 text-white rounded-xl shadow-2xl p-4 flex items-center justify-between hover:bg-primary-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingCart size={24} />
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                </div>
                <span className="font-semibold">Ver Carrinho</span>
              </div>
              <span className="font-bold text-lg">
                {formatCurrency(summary.subtotal)}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu de Navegação */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden">
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 transition-colors',
                  item.active
                    ? 'text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <Icon 
                  size={24} 
                  className={item.active ? 'stroke-[2.5]' : 'stroke-2'}
                />
                <span className={cn(
                  'text-xs',
                  item.active ? 'font-semibold' : 'font-normal'
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
