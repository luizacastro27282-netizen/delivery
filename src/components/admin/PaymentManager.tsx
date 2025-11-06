import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Loader2, Save } from 'lucide-react';
import { useConfigStore } from '@/store/useConfigStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';

interface GatewayConfig {
  enabled: boolean;
  secretKey: string;
  apiUrl: string;
  companyId?: string;
  priority: number;
}

interface PaymentGateways {
  activeGateway: 'medusapay' | 'assetpagamentos';
  rotationEnabled: boolean;
  rotationStrategy: 'round_robin' | 'priority' | 'manual';
  gateways: {
    medusapay: GatewayConfig;
    assetpagamentos: GatewayConfig;
  };
}

export const PaymentManager = () => {
  const { config, updateConfig } = useConfigStore();
  const [gateways, setGateways] = useState<PaymentGateways>({
    activeGateway: 'medusapay',
    rotationEnabled: false,
    rotationStrategy: 'manual',
    gateways: {
      medusapay: {
        enabled: true,
        secretKey: '',
        apiUrl: 'https://api.v2.medusapay.com.br/v1',
        priority: 1,
      },
      assetpagamentos: {
        enabled: false,
        secretKey: '',
        companyId: '',
        apiUrl: 'https://api.assetpagamentos.com/functions/v1',
        priority: 2,
      },
    },
  });

  const [testing, setTesting] = useState<{
    medusapay: boolean;
    assetpagamentos: boolean;
  }>({
    medusapay: false,
    assetpagamentos: false,
  });

  useEffect(() => {
    // Carregar configurações existentes
    if (config?.paymentGateways) {
      setGateways(config.paymentGateways as PaymentGateways);
    }
  }, [config]);

  const handleUpdate = (field: keyof PaymentGateways, value: any) => {
    setGateways((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGatewayUpdate = (
    gateway: 'medusapay' | 'assetpagamentos',
    field: keyof GatewayConfig,
    value: any
  ) => {
    setGateways((prev) => ({
      ...prev,
      gateways: {
        ...prev.gateways,
        [gateway]: {
          ...prev.gateways[gateway],
          [field]: value,
        },
      },
    }));
  };

  const testConnection = async (gateway: 'medusapay' | 'assetpagamentos') => {
    setTesting((prev) => ({ ...prev, [gateway]: true }));

    try {
      const { paymentService } = await import('@/lib/paymentService');
      const success = await paymentService.testGateway(gateway, gateways.gateways[gateway]);

      if (success) {
        toast.success(`Conexão com ${gateway === 'medusapay' ? 'Medusa Pay' : 'Asset Pagamentos'} testada com sucesso!`);
      } else {
        toast.error(`Erro ao testar conexão com ${gateway === 'medusapay' ? 'Medusa Pay' : 'Asset Pagamentos'}`);
      }
    } catch (error) {
      toast.error(`Erro ao testar conexão com ${gateway === 'medusapay' ? 'Medusa Pay' : 'Asset Pagamentos'}`);
    } finally {
      setTesting((prev) => ({ ...prev, [gateway]: false }));
    }
  };

  const handleSave = async () => {
    try {
      const { paymentService } = await import('@/lib/paymentService');
      await paymentService.configureGateways(gateways);

      if (config) {
        await updateConfig({
          ...config,
          paymentGateways: gateways,
        });
      }

      toast.success('Configurações de pagamento salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Configuração de Pagamentos</h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure os gateways de pagamento PIX (Medusa Pay e Asset Pagamentos)
            </p>
          </div>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save size={18} />
            Salvar Configurações
          </Button>
        </div>

        {/* Configurações Gerais */}
        <div className="space-y-4 mb-8">
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Configurações Gerais</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gateway Ativo
                </label>
                <select
                  value={gateways.activeGateway}
                  onChange={(e) => handleUpdate('activeGateway', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={gateways.rotationEnabled}
                >
                  <option value="medusapay">Medusa Pay</option>
                  <option value="assetpagamentos">Asset Pagamentos</option>
                </select>
                {gateways.rotationEnabled && (
                  <p className="text-xs text-gray-500 mt-1">
                    Rotação automática ativada - o gateway será selecionado automaticamente
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gateways.rotationEnabled}
                    onChange={(e) => handleUpdate('rotationEnabled', e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Habilitar Rotação Automática
                  </span>
                </label>
              </div>

              {gateways.rotationEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estratégia de Rotação
                  </label>
                  <select
                    value={gateways.rotationStrategy}
                    onChange={(e) => handleUpdate('rotationStrategy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="round_robin">Round Robin (Alternância)</option>
                    <option value="priority">Priority (Prioridade)</option>
                    <option value="manual">Manual</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {gateways.rotationStrategy === 'round_robin' && 'Alterna entre gateways a cada pedido'}
                    {gateways.rotationStrategy === 'priority' && 'Usa gateway com maior prioridade disponível'}
                    {gateways.rotationStrategy === 'manual' && 'Usa apenas o gateway ativo'}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Medusa Pay */}
        <div className="space-y-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <CreditCard size={24} className="text-primary-600" />
                <h3 className="font-semibold text-gray-900">Medusa Pay</h3>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gateways.gateways.medusapay.enabled}
                    onChange={(e) =>
                      handleGatewayUpdate('medusapay', 'enabled', e.target.checked)
                    }
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Habilitado</span>
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testConnection('medusapay')}
                  disabled={testing.medusapay || !gateways.gateways.medusapay.enabled}
                  className="flex items-center gap-2"
                >
                  {testing.medusapay ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Testar Conexão
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secret Key
                </label>
                <Input
                  type="password"
                  value={gateways.gateways.medusapay.secretKey}
                  onChange={(e) =>
                    handleGatewayUpdate('medusapay', 'secretKey', e.target.value)
                  }
                  placeholder="sk_live_xxx"
                  disabled={!gateways.gateways.medusapay.enabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API URL
                </label>
                <Input
                  value={gateways.gateways.medusapay.apiUrl}
                  onChange={(e) =>
                    handleGatewayUpdate('medusapay', 'apiUrl', e.target.value)
                  }
                  placeholder="https://api.v2.medusapay.com.br/v1"
                  disabled={!gateways.gateways.medusapay.enabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridade
                </label>
                <Input
                  type="number"
                  value={gateways.gateways.medusapay.priority}
                  onChange={(e) =>
                    handleGatewayUpdate('medusapay', 'priority', parseInt(e.target.value) || 1)
                  }
                  min="1"
                  max="10"
                  disabled={!gateways.gateways.medusapay.enabled}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Prioridade na rotação (1 = maior prioridade)
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Asset Pagamentos */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <CreditCard size={24} className="text-primary-600" />
                <h3 className="font-semibold text-gray-900">Asset Pagamentos</h3>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gateways.gateways.assetpagamentos.enabled}
                    onChange={(e) =>
                      handleGatewayUpdate('assetpagamentos', 'enabled', e.target.checked)
                    }
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Habilitado</span>
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testConnection('assetpagamentos')}
                  disabled={testing.assetpagamentos || !gateways.gateways.assetpagamentos.enabled}
                  className="flex items-center gap-2"
                >
                  {testing.assetpagamentos ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Testar Conexão
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secret Key
                </label>
                <Input
                  type="password"
                  value={gateways.gateways.assetpagamentos.secretKey}
                  onChange={(e) =>
                    handleGatewayUpdate('assetpagamentos', 'secretKey', e.target.value)
                  }
                  placeholder="xxx"
                  disabled={!gateways.gateways.assetpagamentos.enabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company ID
                </label>
                <Input
                  value={gateways.gateways.assetpagamentos.companyId || ''}
                  onChange={(e) =>
                    handleGatewayUpdate('assetpagamentos', 'companyId', e.target.value)
                  }
                  placeholder="xxx"
                  disabled={!gateways.gateways.assetpagamentos.enabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API URL
                </label>
                <Input
                  value={gateways.gateways.assetpagamentos.apiUrl}
                  onChange={(e) =>
                    handleGatewayUpdate('assetpagamentos', 'apiUrl', e.target.value)
                  }
                  placeholder="https://api.assetpagamentos.com/functions/v1"
                  disabled={!gateways.gateways.assetpagamentos.enabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridade
                </label>
                <Input
                  type="number"
                  value={gateways.gateways.assetpagamentos.priority}
                  onChange={(e) =>
                    handleGatewayUpdate(
                      'assetpagamentos',
                      'priority',
                      parseInt(e.target.value) || 2
                    )
                  }
                  min="1"
                  max="10"
                  disabled={!gateways.gateways.assetpagamentos.enabled}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Prioridade na rotação (1 = maior prioridade)
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Informações de Webhook */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Configuração de Webhooks</h3>
          <p className="text-sm text-blue-800 mb-3">
            Configure os webhooks nos painéis dos gateways:
          </p>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Medusa Pay:</strong>{' '}
              <code className="bg-blue-100 px-2 py-1 rounded">
                https://api.wellsole.store/api/v1/payments/webhook/medusapay
              </code>
            </div>
            <div>
              <strong>Asset Pagamentos:</strong>{' '}
              <code className="bg-blue-100 px-2 py-1 rounded">
                https://api.wellsole.store/api/v1/payments/webhook/assetpagamentos
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

