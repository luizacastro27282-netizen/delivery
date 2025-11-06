import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '@/hooks/useCart';

interface SimpleHeaderProps {
  title: string;
  showBack?: boolean;
  showCart?: boolean;
}

export const SimpleHeader = ({ title, showBack = true, showCart = true }: SimpleHeaderProps) => {
  const navigate = useNavigate();
  const cart = useCart();
  const itemCount = cart?.itemCount || 0;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={24} />
              </button>
            )}
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>

          {showCart && (
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
          )}
        </div>
      </div>
    </header>
  );
};

