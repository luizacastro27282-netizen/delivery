import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useConfigStore } from '@/store/useConfigStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'react-hot-toast';

export const ConfigManager = () => {
  const { config, loadConfig, updateConfig } = useConfigStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  if (!config || !formData) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  const handleSave = async () => {
    setLoading(true);
    
    try {
      await updateConfig(formData);
      toast.success('Configurações salvas com sucesso!');
      await loadConfig();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const updateStore = (field: string, value: any) => {
    setFormData({
      ...formData,
      store: { ...formData.store, [field]: value }
    });
  };

  const updateSchedule = (day: string, field: string, value: any) => {
    setFormData({
      ...formData,
      horarioFuncionamento: {
        ...formData.horarioFuncionamento,
        [day]: {
          ...formData.horarioFuncionamento[day],
          [field]: value
        }
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Configurações da Loja</h2>
        <Button onClick={handleSave} loading={loading}>
          <Save size={18} className="mr-2" />
          Salvar
        </Button>
      </div>

      <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
        {/* Informações Básicas */}
        <section>
          <h3 className="font-semibold mb-4">Informações Básicas</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome da Loja</label>
              <Input
                value={formData.store.name}
                onChange={(e) => updateStore('name', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Endereço</label>
              <Input
                value={formData.store.address}
                onChange={(e) => updateStore('address', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Telefone</label>
                <Input
                  value={formData.store.phone}
                  onChange={(e) => updateStore('phone', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">WhatsApp</label>
                <Input
                  value={formData.store.whatsapp}
                  onChange={(e) => updateStore('whatsapp', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={formData.store.email}
                onChange={(e) => updateStore('email', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Taxas e Valores */}
        <section>
          <h3 className="font-semibold mb-4">Taxas e Valores</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Taxa de Entrega</label>
              <Input
                type="number"
                step="0.01"
                value={formData.store.taxaEntrega}
                onChange={(e) => updateStore('taxaEntrega', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Pedido Mínimo</label>
              <Input
                type="number"
                step="0.01"
                value={formData.store.pedidoMinimo}
                onChange={(e) => updateStore('pedidoMinimo', parseFloat(e.target.value))}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Frete Grátis Acima de</label>
            <Input
              type="number"
              step="0.01"
              value={formData.freeDeliveryAbove || 50}
              onChange={(e) => setFormData({ ...formData, freeDeliveryAbove: parseFloat(e.target.value) })}
            />
          </div>
        </section>

        {/* Horário de Funcionamento */}
        <section>
          <h3 className="font-semibold mb-4">Horário de Funcionamento</h3>
          <div className="space-y-3">
            {Object.entries(formData.horarioFuncionamento).map(([day, schedule]: [string, any]) => (
              <div key={day} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="font-medium capitalize">{day}</label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={schedule.aberto}
                      onChange={(e) => updateSchedule(day, 'aberto', e.target.checked)}
                      className="w-4 h-4"
                    />
                    Aberto
                  </label>
                </div>
                {schedule.aberto && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Abertura</label>
                      <Input
                        type="time"
                        value={schedule.abertura}
                        onChange={(e) => updateSchedule(day, 'abertura', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Fechamento</label>
                      <Input
                        type="time"
                        value={schedule.fechamento}
                        onChange={(e) => updateSchedule(day, 'fechamento', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

