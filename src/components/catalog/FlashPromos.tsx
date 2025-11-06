import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Flame } from 'lucide-react';
import { Product } from '@/types/product';
import { useProductStore } from '@/store/useProductStore';
import { formatCurrency } from '@/lib/utils';

interface FlashPromosProps {
  onProductSelect: (product: Product) => void;
}

export const FlashPromos = ({ onProductSelect }: FlashPromosProps) => {
  const { products } = useProductStore();
  
  // Filtrar combos disponíveis (case-insensitive)
  const combos = products.filter(p => 
    p.category?.toLowerCase() === 'combos' && p.available
  );
  
  // Timer de 59 minutos (em segundos)
  const [timeRemaining, setTimeRemaining] = useState(59 * 60); // 59 minutos
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          return 59 * 60; // Resetar para 59 minutos quando acabar
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Formatar tempo MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  if (combos.length === 0) return null;
  
  return (
    <div className="bg-gradient-to-r from-red-500 to-orange-500 py-4 px-4 my-6 rounded-lg shadow-lg">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="text-white animate-pulse" size={28} />
            <h2 className="text-white font-bold text-xl">Promoções Relâmpago</h2>
          </div>
          
          {/* Cronômetro */}
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
            <Clock className="text-white" size={20} />
            <div className="text-white">
              <div className="text-xs font-medium">Termina em</div>
              <div className="text-lg font-bold tabular-nums">{formatTime(timeRemaining)}</div>
            </div>
          </div>
        </div>
        
        {/* Grid Responsivo de Combos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {combos.slice(0, 3).map((combo, index) => {
            // Calcular preço base do combo
            const basePrice = combo.price || combo.basePrice || 0;
            const comparePrice = basePrice * 1.2; // Preço "de" (20% maior)
            
            return (
              <motion.div
                key={combo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all flex flex-col"
              >
                {/* Imagem */}
                <div 
                  className="w-full h-48 bg-gray-100 cursor-pointer"
                  onClick={() => onProductSelect(combo)}
                >
                  {combo.images && combo.images[0] ? (
                    <img
                      src={combo.images[0]}
                      alt={combo.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Flame size={64} />
                    </div>
                  )}
                </div>
                
                {/* Informações */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 
                    className="font-bold text-gray-900 text-lg mb-2 cursor-pointer hover:text-primary-600"
                    onClick={() => onProductSelect(combo)}
                  >
                    {combo.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
                    {combo.description}
                  </p>
                  
                  {/* Preço e Botão */}
                  <div className="flex items-end justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-xs text-gray-400 line-through">
                          De {formatCurrency(comparePrice)}
                        </div>
                        <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">
                          -20%
                        </div>
                      </div>
                      <div className="text-xl font-bold text-primary-600">
                        Por {formatCurrency(basePrice)}
                      </div>
                    </div>
                    
                    {/* Botão Adicionar */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onProductSelect(combo);
                      }}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap flex items-center gap-2 shadow-lg"
                    >
                      <span className="text-sm">Ver</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Badge de escassez */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: [0.9, 1, 0.9] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mt-4 text-center"
        >
          <span className="inline-block bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-sm font-bold">
            🔥 Últimas unidades! Aproveite agora!
          </span>
        </motion.div>
      </div>
    </div>
  );
};

