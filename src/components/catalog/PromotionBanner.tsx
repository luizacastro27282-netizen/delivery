import { motion } from 'framer-motion';
import { Tag, Clock, Calendar } from 'lucide-react';
import { Promotion } from '@/types/promotion';
import { Badge } from '@/components/ui/Badge';

interface PromotionBannerProps {
  promotions: Promotion[];
}

export const PromotionBanner = ({ promotions }: PromotionBannerProps) => {
  if (!promotions || promotions.length === 0) return null;

  // Pega as 3 primeiras promoções ativas do tipo time_based
  const activeTimePromotions = promotions
    .filter(p => p && p.type === 'time_based')
    .slice(0, 3);

  if (activeTimePromotions.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Tag className="text-primary-600" size={20} />
        Promoções Ativas
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activeTimePromotions.map((promo, index) => (
          <motion.div
            key={promo.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-4 text-white shadow-lg"
          >
            <div className="flex items-start justify-between mb-2">
              <Badge variant="warning" className="bg-yellow-400 text-yellow-900">
                <Tag size={12} className="mr-1" />
                Oferta
              </Badge>
              
              {promo.conditions?.dayOfWeek && (
                <Calendar size={16} className="opacity-80" />
              )}
            </div>

            <h4 className="font-bold text-lg mb-1">{promo.name}</h4>
            
            {promo.description && (
              <p className="text-sm opacity-90 mb-2">{promo.description}</p>
            )}

            {promo.discount && (
              <div className="flex items-center gap-2 mt-3">
                {promo.discount.kind === 'percentage' && (
                  <span className="text-2xl font-bold">{promo.discount.value}% OFF</span>
                )}
                {promo.discount.kind === 'fixed' && (
                  <span className="text-2xl font-bold">R$ {promo.discount.value.toFixed(2)} OFF</span>
                )}
              </div>
            )}

            {promo.conditions?.hourRange && (
              <div className="flex items-center gap-1 mt-2 text-sm opacity-90">
                <Clock size={14} />
                {promo.conditions.hourRange[0]}h - {promo.conditions.hourRange[1]}h
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

