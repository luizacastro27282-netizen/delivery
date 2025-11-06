import { useEffect } from 'react';
import { Tag, Clock, Calendar, Percent, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { usePromotionStore } from '@/store/usePromotionStore';
import { SimpleHeader } from '@/components/layout/SimpleHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export const Promocoes = () => {
  const { loadPromotions, getActivePromotions } = usePromotionStore();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    loadPromotions();
  }, [loadPromotions]);

  const activePromotions = getActivePromotions();

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Cupom copiado!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getPromotionIcon = (type: string) => {
    switch (type) {
      case 'time_based': return <Clock size={20} />;
      case 'coupon': return <Tag size={20} />;
      case 'bulk': return <Percent size={20} />;
      default: return <Tag size={20} />;
    }
  };

  const getDayName = (day: number) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[day];
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      <SimpleHeader title="Promoções" showBack={false} />

      <main className="max-w-7xl mx-auto px-4 py-6">

        {activePromotions.length === 0 ? (
          <div className="text-center py-20">
            <Tag size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Nenhuma promoção ativa no momento</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activePromotions.map((promo, index) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Header com cor baseada no tipo */}
                <div className={`p-4 ${
                  promo.type === 'time_based' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                  promo.type === 'coupon' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                  promo.type === 'bulk' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                  'bg-gradient-to-r from-purple-500 to-purple-600'
                } text-white`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getPromotionIcon(promo.type)}
                      <Badge variant="warning" className="bg-yellow-400 text-yellow-900">
                        OFERTA
                      </Badge>
                    </div>
                    {promo.conditions?.dayOfWeek && (
                      <Calendar size={16} />
                    )}
                  </div>
                  <h3 className="text-xl font-bold">{promo.name}</h3>
                </div>

                {/* Corpo */}
                <div className="p-4">
                  {promo.description && (
                    <p className="text-gray-700 mb-4">{promo.description}</p>
                  )}

                  {/* Desconto */}
                  {promo.discount && (
                    <div className="mb-4 p-3 bg-primary-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Desconto</p>
                      {promo.discount.kind === 'percentage' && (
                        <p className="text-3xl font-bold text-primary-600">
                          {promo.discount.value}% OFF
                        </p>
                      )}
                      {promo.discount.kind === 'fixed' && (
                        <p className="text-3xl font-bold text-primary-600">
                          R$ {promo.discount.value.toFixed(2)} OFF
                        </p>
                      )}
                      {promo.discount.kind === 'freeItem' && (
                        <p className="text-lg font-bold text-primary-600">
                          Leve {promo.discount.forEvery} pague {promo.discount.payFor}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Condições */}
                  <div className="space-y-2 text-sm">
                    {promo.conditions?.dayOfWeek && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={14} />
                        <span>
                          {promo.conditions.dayOfWeek.map(day => getDayName(day)).join(', ')}
                        </span>
                      </div>
                    )}

                    {promo.conditions?.hourRange && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={14} />
                        <span>
                          {promo.conditions.hourRange[0]}h - {promo.conditions.hourRange[1]}h
                        </span>
                      </div>
                    )}

                    {promo.minSubtotal && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Percent size={14} />
                        <span>Pedido mínimo: R$ {promo.minSubtotal.toFixed(2)}</span>
                      </div>
                    )}

                    {promo.code && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 mb-2">Código do cupom</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 p-3 bg-gray-100 rounded border-2 border-dashed border-gray-300">
                            <p className="text-lg font-mono font-bold text-gray-900">{promo.code}</p>
                          </div>
                          <Button
                            onClick={() => handleCopyCoupon(promo.code!)}
                            variant="outline"
                            size="sm"
                            className="px-3"
                          >
                            {copiedCode === promo.code ? (
                              <Check size={18} className="text-green-600" />
                            ) : (
                              <Copy size={18} />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

