import { motion } from 'framer-motion';
import { Tag, TrendingDown } from 'lucide-react';
import { CartSummary } from '@/types/order';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface OrderSummaryProps {
  summary: CartSummary;
}

export const OrderSummary = ({ summary }: OrderSummaryProps) => {
  const subtotalWithDiscount = Math.max(0, (summary?.subtotal || 0) - (summary?.discount || 0));
  const hasDiscount = (summary?.discount || 0) > 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <h3 className="text-xl font-bold mb-4">Resumo do Pedido</h3>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-gray-700">
          <span>
            Subtotal{hasDiscount ? ' (com descontos)' : ''} ({summary.itemCount} {summary.itemCount === 1 ? 'item' : 'itens'})
          </span>
          <span>{formatCurrency(hasDiscount ? subtotalWithDiscount : summary.subtotal)}</span>
        </div>

        {hasDiscount && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between text-green-600 font-semibold"
          >
            <span className="flex items-center gap-1">
              <Tag size={16} />
              Descontos
            </span>
            <span>-{formatCurrency(summary.discount)}</span>
          </motion.div>
        )}

        <div className="flex justify-between text-gray-700">
          <span>Taxa de entrega</span>
          <span>{formatCurrency(summary.deliveryFee)}</span>
        </div>
      </div>

      {/* Promoções aplicadas */}
      {summary.appliedPromotions.length > 0 && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-1">
            <Tag size={14} />
            Promoções aplicadas:
          </p>
          <div className="flex flex-wrap gap-1">
            {summary.appliedPromotions.slice(0, 3).map((promo, idx) => (
              <Badge key={idx} variant="success" className="text-xs">
                {promo.promotionName}
              </Badge>
            ))}
            {summary.appliedPromotions.length > 3 && (
              <Badge variant="success" className="text-xs">
                +{summary.appliedPromotions.length - 3}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Total economizado */}
      {summary.savings > 0 && (
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="mb-4 p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Você economizou</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.savings)}</p>
            </div>
            <TrendingDown size={32} className="opacity-80" />
          </div>
        </motion.div>
      )}

      {/* Total */}
      <div className="border-t-2 border-gray-200 pt-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-2xl font-bold text-primary-600">
            {formatCurrency(summary.total)}
          </span>
        </div>
      </div>
    </div>
  );
};

