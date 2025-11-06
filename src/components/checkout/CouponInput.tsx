import { useState } from 'react';
import { Tag, X } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { usePromotionStore } from '@/store/usePromotionStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'react-hot-toast';

interface CouponInputProps {
  subtotal: number;
}

export const CouponInput = ({ subtotal }: CouponInputProps) => {
  const { appliedCoupon, applyCoupon, removeCoupon, setCouponDiscount } = useCartStore();
  const { validateCoupon } = usePromotionStore();
  
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Digite um código de cupom');
      return;
    }

    setLoading(true);
    
    try {
      const result = await validateCoupon(couponCode.trim(), subtotal);
      
      if (result.valid && result.promotion) {
        // A API retorna discountAmount no promotion
        const discountAmount = (result.promotion as any)?.discountAmount ?? 0;
        setCouponDiscount(discountAmount);
        applyCoupon(couponCode.trim());
        toast.success('Cupom aplicado com sucesso! 🎉');
        setCouponCode('');
      } else {
        setCouponDiscount(0);
        toast.error((result as any)?.reason || 'Cupom inválido');
      }
    } catch (error) {
      console.error('Erro ao validar cupom:', error);
      setCouponDiscount(0);
      toast.error('Erro ao validar cupom. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast.success('Cupom removido');
  };

  if (appliedCoupon) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="text-green-600" size={20} />
            <div>
              <p className="font-semibold text-green-900">Cupom aplicado!</p>
              <p className="text-sm text-green-700">{appliedCoupon}</p>
            </div>
          </div>
          
          <button
            onClick={handleRemoveCoupon}
            className="text-green-600 hover:text-green-800 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="text-primary-600" size={20} />
        <h3 className="font-semibold">Tem um cupom?</h3>
      </div>
      
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Digite o código"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
          className="flex-1"
        />
        <Button
          onClick={handleApplyCoupon}
          loading={loading}
          disabled={!couponCode.trim()}
        >
          Aplicar
        </Button>
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        Ex: BEMVINDO10, PIZZA20
      </p>
    </div>
  );
};

