import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Percent, DollarSign } from 'lucide-react';
import { useConfigStore } from '@/store/useConfigStore';
import { useProductStore } from '@/store/useProductStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'react-hot-toast';
import { SearchableSelect } from '@/components/ui/SearchableSelect';

interface OrderBumpItem {
  productId: string;
  desconto: number;
  descontoTipo: 'percent' | 'fixed';
  ativo: boolean;
}

export const OrderBumpsManager = () => {
  const { config, loadConfig, updateConfig } = useConfigStore();
  const { products, loadProducts } = useProductStore();
  const [loading, setLoading] = useState(false);
  const [orderBumps, setOrderBumps] = useState<any>(null);

  useEffect(() => {
    loadConfig();
    loadProducts();
  }, [loadConfig, loadProducts]);

  useEffect(() => {
    if (config?.orderBumps) {
      setOrderBumps({
        enabled: config.orderBumps.enabled,
        titulo: config.orderBumps.titulo || 'Peça também',
        itens: config.orderBumps.itens || [],
        quantidade: config.orderBumps.quantidade || 3,
        sortBy: config.orderBumps.sortBy || 'price'
      });
    }
  }, [config]);

  if (!orderBumps) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  // Preparar opções de produtos
  const productOptions = products.map(p => ({
    value: p.id,
    label: `${p.name} - ${p.category}`
  }));

  const handleSave = async () => {
    setLoading(true);
    
    try {
      if (!config) {
        toast.error('Configuração não encontrada');
        return;
      }

      await updateConfig({
        ...config,
        orderBumps: orderBumps
      });
      
      toast.success('Order Bumps salvos com sucesso!');
      await loadConfig();
    } catch (error) {
      console.error('Erro ao salvar order bumps:', error);
      toast.error('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setOrderBumps({
      ...orderBumps,
      itens: [
        ...orderBumps.itens,
        {
          productId: '',
          desconto: 0,
          descontoTipo: 'percent',
          ativo: true
        }
      ]
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItens = orderBumps.itens.filter((_: any, i: number) => i !== index);
    setOrderBumps({ ...orderBumps, itens: newItens });
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const newItens = [...orderBumps.itens];
    newItens[index] = { ...newItens[index], [field]: value };
    setOrderBumps({ ...orderBumps, itens: newItens });
  };

  const getProductById = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Order Bumps (Upsells)</h2>
        <Button onClick={handleSave} loading={loading}>
          <Save size={18} className="mr-2" />
          Salvar
        </Button>
      </div>

      <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
        {/* Configurações Gerais */}
        <section>
          <h3 className="font-semibold mb-4">Configurações Gerais</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={orderBumps.enabled}
                onChange={(e) => setOrderBumps({ ...orderBumps, enabled: e.target.checked })}
                className="w-4 h-4"
              />
              Habilitar Order Bumps
            </label>

            {orderBumps.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Título</label>
                  <Input
                    value={orderBumps.titulo}
                    onChange={(e) => setOrderBumps({ ...orderBumps, titulo: e.target.value })}
                    placeholder="Peça também"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Quantidade Máxima</label>
                    <Input
                      type="number"
                      value={orderBumps.quantidade}
                      onChange={(e) => setOrderBumps({ ...orderBumps, quantidade: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Ordenar por</label>
                    <select
                      value={orderBumps.sortBy}
                      onChange={(e) => setOrderBumps({ ...orderBumps, sortBy: e.target.value })}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg"
                    >
                      <option value="price">Preço</option>
                      <option value="name">Nome</option>
                      <option value="category">Categoria</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Itens do Order Bump */}
        {orderBumps.enabled && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Produtos do Order Bump</h3>
              <Button onClick={handleAddItem} size="sm">
                <Plus size={16} className="mr-2" />
                Adicionar Produto
              </Button>
            </div>

            <div className="space-y-4">
              {orderBumps.itens.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum produto configurado</p>
                  <p className="text-sm mt-2">Clique em "Adicionar Produto" para começar</p>
                </div>
              ) : (
                orderBumps.itens.map((item: OrderBumpItem, index: number) => {
                  const product = getProductById(item.productId);
                  
                  return (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-medium mb-2">Produto #{index + 1}</h4>
                          
                          {/* Seleção de Produto */}
                          <div className="mb-4">
                            <SearchableSelect
                              options={productOptions}
                              value={item.productId}
                              onChange={(value) => handleUpdateItem(index, 'productId', value)}
                              placeholder="Selecione um produto"
                              label="Produto"
                              searchPlaceholder="Pesquisar produto..."
                            />
                          </div>

                          {/* Informações do Produto Selecionado */}
                          {product && (
                            <div className="bg-white rounded-lg p-3 mb-4 border">
                              <div className="flex items-center gap-3">
                                {product.images[0] && (
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-16 h-16 object-cover rounded"
                                  />
                                )}
                                <div className="flex-1">
                                  <p className="font-semibold">{product.name}</p>
                                  <p className="text-sm text-gray-600">{product.category}</p>
                                  <p className="text-sm font-medium text-primary-600">
                                    Preço: {product.price ? `R$ ${product.price.toFixed(2)}` : 
                                            product.basePrice ? `R$ ${product.basePrice.toFixed(2)}` : 
                                            'Variável'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Configuração de Desconto */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Tipo de Desconto</label>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateItem(index, 'descontoTipo', 'percent')}
                                  className={`flex-1 p-2 rounded-lg border-2 transition-all ${
                                    item.descontoTipo === 'percent'
                                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                                      : 'border-gray-300 text-gray-600'
                                  }`}
                                >
                                  <Percent size={16} className="mx-auto mb-1" />
                                  <span className="text-xs">Percentual</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateItem(index, 'descontoTipo', 'fixed')}
                                  className={`flex-1 p-2 rounded-lg border-2 transition-all ${
                                    item.descontoTipo === 'fixed'
                                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                                      : 'border-gray-300 text-gray-600'
                                  }`}
                                >
                                  <DollarSign size={16} className="mx-auto mb-1" />
                                  <span className="text-xs">Fixo</span>
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Valor do Desconto
                                {item.descontoTipo === 'percent' && ' (%)'}
                                {item.descontoTipo === 'fixed' && ' (R$)'}
                              </label>
                              <Input
                                type="number"
                                step={item.descontoTipo === 'percent' ? '1' : '0.01'}
                                min="0"
                                max={item.descontoTipo === 'percent' ? '100' : undefined}
                                value={item.desconto}
                                onChange={(e) => handleUpdateItem(index, 'desconto', parseFloat(e.target.value) || 0)}
                                placeholder={item.descontoTipo === 'percent' ? '10' : '5.00'}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">Status</label>
                              <label className="flex items-center gap-2 h-10">
                                <input
                                  type="checkbox"
                                  checked={item.ativo}
                                  onChange={(e) => handleUpdateItem(index, 'ativo', e.target.checked)}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm">Ativo</span>
                              </label>
                            </div>
                          </div>

                          {/* Preview do Preço com Desconto */}
                          {product && item.desconto > 0 && (
                            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                              <p className="text-sm font-semibold text-green-800 mb-1">
                                Preço no Order Bump:
                              </p>
                              <div className="flex items-center gap-2">
                                {product.price && (
                                  <>
                                    <span className="text-sm text-gray-500 line-through">
                                      R$ {product.price.toFixed(2)}
                                    </span>
                                    <span className="text-lg font-bold text-green-700">
                                      R$ {item.descontoTipo === 'percent'
                                        ? (product.price * (1 - item.desconto / 100)).toFixed(2)
                                        : Math.max(0, product.price - item.desconto).toFixed(2)}
                                    </span>
                                    <span className="text-xs text-green-600">
                                      {item.descontoTipo === 'percent' 
                                        ? `(${item.desconto}% OFF)`
                                        : `(R$ ${item.desconto.toFixed(2)} OFF)`}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-700 p-2"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

