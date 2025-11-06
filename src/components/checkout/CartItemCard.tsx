import { Trash2, Minus, Plus } from 'lucide-react';
import { CartItem } from '@/types/product';
import { useCartStore } from '@/store/useCartStore';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface CartItemCardProps {
  item: CartItem;
}

export const CartItemCard = ({ item }: CartItemCardProps) => {
  const { updateItemQuantity, removeItem } = useCartStore();

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="flex gap-4">
        {/* Imagem */}
        <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
          {item.product.images[0] && (
            <img
              src={item.product.images[0]}
              alt={item.product.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Detalhes */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-semibold text-gray-900">{item.product.name}</h4>
              
              {/* Tamanho */}
              {item.selectedSize && (
                <p className="text-sm text-gray-600">
                  Tamanho: <span className="capitalize">{item.selectedSize}</span>
                </p>
              )}

              {/* Sabores */}
              {item.selectedFlavors && item.selectedFlavors.length > 0 && (
                <p className="text-sm text-gray-600">
                  Sabores: {item.selectedFlavors.join(', ')}
                </p>
              )}

              {/* Adicionais */}
              {item.selectedAddons && item.selectedAddons.length > 0 && (
                <p className="text-sm text-gray-600">
                  Adicionais: {item.selectedAddons.map(a => a.name).join(', ')}
                </p>
              )}

              {/* Notas */}
              {item.notes && (
                <p className="text-sm text-gray-500 italic">Obs: {item.notes}</p>
              )}
            </div>

            <button
              onClick={() => removeItem(item.id)}
              className="text-red-500 hover:text-red-700 transition-colors p-1"
              aria-label="Remover item"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {/* Promoções aplicadas */}
          {item.appliedPromotions && item.appliedPromotions.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {item.appliedPromotions.map((promo, idx) => (
                <Badge key={idx} variant="success" className="text-xs">
                  {promo.promotionName}: -{formatCurrency(promo.discount)}
                </Badge>
              ))}
            </div>
          )}

          {/* Preço e quantidade */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                className="p-1 hover:bg-white rounded transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="font-semibold w-6 text-center text-sm">{item.quantity}</span>
              <button
                onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                className="p-1 hover:bg-white rounded transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="text-right">
              <p className="font-bold text-primary-600">{formatCurrency(item.totalPrice)}</p>
              <p className="text-xs text-gray-500">{formatCurrency(item.unitPrice)} cada</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

