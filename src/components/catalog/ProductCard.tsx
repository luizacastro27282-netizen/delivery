import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';
import { Product } from '@/types/product';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  index: number;
}

export const ProductCard = ({ product, onSelect, index }: ProductCardProps) => {
  const getPrice = () => {
    if (product.price) return formatCurrency(product.price);
    if (product.basePrice) return formatCurrency(product.basePrice);
    if (product.basePrices) {
      const prices = Object.values(product.basePrices);
      const minPrice = Math.min(...prices);
      return `A partir de ${formatCurrency(minPrice)}`;
    }
    return 'Consulte';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
      onClick={() => onSelect(product)}
    >
      <div className="flex items-center">
        {/* Conteúdo à esquerda */}
        <div className="flex-1 p-4">
          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {product.tags.includes('mais-vendida') && (
                <Badge variant="warning" className="text-xs">
                  🔥 Mais vendida
                </Badge>
              )}
              {product.tags.includes('promocao') && (
                <Badge variant="success" className="text-xs">
                  <Tag size={10} className="mr-1" />
                  Promoção
                </Badge>
              )}
              {product.tags.includes('premium') && (
                <Badge variant="info" className="text-xs">
                  ⭐ Premium
                </Badge>
              )}
            </div>
          )}

          {/* Título */}
          <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1">
            {product.name}
          </h3>
          
          {/* Descrição */}
          {product.description && (
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Preço */}
          <div className="mt-auto">
            <span className="text-sm text-gray-500">A partir de</span>
            <p className="text-lg font-bold text-primary-600">
              {getPrice()}
            </p>
          </div>
        </div>

        {/* Imagem à direita */}
        <div className="w-28 h-28 md:w-32 md:h-32 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden mr-[5px]">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-4xl">🍕</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
