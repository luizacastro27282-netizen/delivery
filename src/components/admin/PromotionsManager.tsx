import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Tag } from 'lucide-react';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Promotion } from '@/types/promotion';
import toast from 'react-hot-toast';

interface PromotionFormData {
  name: string;
  type: 'time_based' | 'coupon' | 'bulk_discount' | 'price_compare';
  code?: string;
  discount: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  minSubtotal?: number;
  validFrom: string;
  validUntil: string;
  activeDays: number[];
  activeHours?: {
    start: string;
    end: string;
  };
  applyOrder?: 'first' | 'last' | 'best';
  stackable: boolean;
  tieBreaker?: 'highest' | 'lowest' | 'first';
}

export const PromotionsManager = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState<PromotionFormData>({
    name: '',
    type: 'coupon',
    code: '',
    discount: { type: 'percentage', value: 0 },
    minSubtotal: 0,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    activeDays: [0, 1, 2, 3, 4, 5, 6],
    applyOrder: 'best',
    stackable: false,
    tieBreaker: 'highest'
  });

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ promotions: Promotion[] }>('/admin/promotions', {
        requiresAdmin: true
      });
      setPromotions(response.promotions || []);
    } catch (error) {
      console.error('Erro ao carregar promoções:', error);
      toast.error('Erro ao carregar promoções');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPromotion) {
        await api.put(`/admin/promotions/${editingPromotion.id}`, formData, {
          requiresAdmin: true
        });
        toast.success('Promoção atualizada com sucesso!');
      } else {
        await api.post('/admin/promotions', formData, {
          requiresAdmin: true
        });
        toast.success('Promoção criada com sucesso!');
      }
      loadPromotions();
      setShowForm(false);
      setEditingPromotion(null);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar promoção:', error);
      toast.error('Erro ao salvar promoção');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta promoção?')) return;
    
    try {
      await api.delete(`/admin/promotions/${id}`, {
        requiresAdmin: true
      });
      toast.success('Promoção deletada com sucesso!');
      loadPromotions();
    } catch (error) {
      console.error('Erro ao deletar promoção:', error);
      toast.error('Erro ao deletar promoção');
    }
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    const promo = promotion as any;
    setFormData({
      name: promo.name,
      type: promo.type as any,
      code: promo.code || '',
      discount: promo.discount || { type: 'percentage', value: 0 },
      minSubtotal: promo.minSubtotal,
      validFrom: (promo.validFrom || new Date().toISOString()).split('T')[0],
      validUntil: (promo.validUntil || new Date().toISOString()).split('T')[0],
      activeDays: promo.activeDays || [],
      activeHours: promo.activeHours,
      applyOrder: promo.applyOrder as any,
      stackable: promo.stackable,
      tieBreaker: promo.tieBreaker
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'coupon',
      code: '',
      discount: { type: 'percentage', value: 0 },
      minSubtotal: 0,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      activeDays: [0, 1, 2, 3, 4, 5, 6],
      applyOrder: 'best',
      stackable: false,
      tieBreaker: 'highest'
    });
  };

  const filteredPromotions = promotions.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const typeLabels = {
    time_based: 'Baseado em Horário',
    coupon: 'Cupom',
    bulk_discount: 'Desconto em Quantidade',
    price_compare: 'Comparação de Preço'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Gerenciar Promoções</h2>
          <Button onClick={() => { setShowForm(true); setEditingPromotion(null); resetForm(); }}>
            <Plus size={18} className="mr-2" />
            Nova Promoção
          </Button>
        </div>

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Pesquisar promoções..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold mb-4">
            {editingPromotion ? 'Editar Promoção' : 'Nova Promoção'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {formData.type === 'coupon' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Código do Cupom</label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required={formData.type === 'coupon'}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Desconto</label>
                <select
                  value={formData.discount.type}
                  onChange={(e) => setFormData({
                    ...formData,
                    discount: { ...formData.discount, type: e.target.value as 'percentage' | 'fixed' }
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="percentage">Percentual (%)</option>
                  <option value="fixed">Valor Fixo (R$)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Valor do Desconto {formData.discount.type === 'percentage' ? '(%)' : '(R$)'}
                </label>
                <Input
                  type="number"
                  value={formData.discount.value}
                  onChange={(e) => setFormData({
                    ...formData,
                    discount: { ...formData.discount, value: parseFloat(e.target.value) || 0 }
                  })}
                  required
                  min="0"
                  step={formData.discount.type === 'percentage' ? '1' : '0.01'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Subtotal Mínimo (R$)</label>
                <Input
                  type="number"
                  value={formData.minSubtotal || 0}
                  onChange={(e) => setFormData({ ...formData, minSubtotal: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Válido de</label>
                <Input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Válido até</label>
                <Input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.stackable}
                  onChange={(e) => setFormData({ ...formData, stackable: e.target.checked })}
                />
                <span className="text-sm">Permitir empilhamento</span>
              </label>
            </div>

            <div className="flex gap-2">
              <Button type="submit">Salvar</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingPromotion(null);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Promoções */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Carregando...</div>
          ) : filteredPromotions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Tag size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Nenhuma promoção encontrada</p>
            </div>
          ) : (
            filteredPromotions.map((promotion) => (
              <div key={promotion.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{promotion.name}</h3>
                      <Badge variant="info">{(typeLabels as any)[promotion.type] || promotion.type}</Badge>
                      {promotion.code && (
                        <Badge variant="success">{promotion.code}</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        Desconto: {(promotion.discount as any)?.kind === 'percentage'
                          ? `${(promotion.discount as any)?.value}%`
                          : `R$ ${((promotion.discount as any)?.value || 0).toFixed(2)}`}
                      </p>
                      <p>
                        Válido: {new Date((promotion as any).validFrom || Date.now()).toLocaleDateString()} até{' '}
                        {new Date((promotion as any).validUntil || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(promotion)}
                      className="text-primary-600 hover:text-primary-700 p-2"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(promotion.id)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

