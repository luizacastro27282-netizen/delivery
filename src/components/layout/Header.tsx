import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, MapPin, Clock, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useConfigStore } from '@/store/useConfigStore';

export const Header = () => {
  const navigate = useNavigate();
  const cart = useCart();
  const itemCount = cart?.itemCount || 0;
  const { config, loadConfig, isStoreOpen, getOpeningMessage } = useConfigStore();

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  if (!config) return null;

  const storeOpen = isStoreOpen();
  const openingMessage = getOpeningMessage();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Logo e Info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg flex-shrink-0">
              <img 
                src={config.store.logo} 
                alt={config.store.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback para emoji se imagem não carregar
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center"><span class="text-2xl">🍕</span></div>';
                }}
              />
            </div>
            
            {/* Info */}
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                {config.store.name}
              </h1>
              
              {/* Endereço */}
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin size={14} />
                <span>{config.store.address}</span>
              </div>
              
              {/* Telefone */}
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Phone size={14} />
                <span>{config.store.phone}</span>
              </div>
            </div>
          </div>

          {/* Carrinho */}
          <button 
            onClick={() => navigate('/checkout')}
            className="relative bg-primary-600 text-white p-3 rounded-full hover:bg-primary-700 transition-colors shadow-lg"
          >
            <ShoppingCart size={24} />
            {itemCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
              >
                {itemCount}
              </motion.span>
            )}
          </button>
        </div>

        {/* Status */}
        <div className="flex items-center justify-center">
          {storeOpen ? (
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <Clock size={16} />
              <span className="text-sm font-semibold">Aberto agora</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full">
              <Clock size={16} />
              <span className="text-sm font-semibold">Fechado • {openingMessage}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

