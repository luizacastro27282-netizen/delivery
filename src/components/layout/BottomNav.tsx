import { Home, Tag, Receipt, User, ShoppingCart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
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
    <div>
      {/* Carrinho Fixo - aparece quando há itens */}
      <AnimatePresence>
        {itemCount > 0 && location.pathname === '/' && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            style={{
              position: 'fixed',
              bottom: '80px',
              left: '16px',
              right: '16px',
              zIndex: 998
            }}
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
      <nav 
        id="mobile-bottom-nav"
        style={{ 
          zIndex: 1000, 
          display: 'block',
          visibility: 'visible',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100vw',
          maxWidth: '100%',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e5e7eb',
          boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
          margin: 0,
          padding: 0
        }}
      >
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          width: '100%', 
          height: '64px'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: item.active ? '#dc2626' : '#6b7280',
                  transition: 'color 0.2s',
                  width: '100%',
                  height: '100%'
                }}
              >
                <Icon 
                  size={24} 
                  strokeWidth={item.active ? 2.5 : 2}
                />
                <span style={{
                  fontSize: '12px',
                  fontWeight: item.active ? '600' : '400'
                }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
