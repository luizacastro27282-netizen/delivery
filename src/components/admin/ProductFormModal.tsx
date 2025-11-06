import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Product, ProductVariant } from '@/types/product';
import { useProductStore } from '@/store/useProductStore';
import { toast } from 'react-hot-toast';

interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductFormModal = ({ product, onClose }: ProductFormModalProps) => {
  const { addProduct, updateProduct } = useProductStore();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'pizzas',
    type: 'pizza' as 'pizza' | 'combo' | 'drink' | 'dessert',
    price: '',
    basePrice: '',
    basePrices: {
      pequena: '',
      media: '',
      grande: ''
    },
    images: [''],
    tags: [] as string[],
    variants: [] as ProductVariant[]
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || 'pizzas',
        type: (product.type || 'pizza') as any,
        price: product.price?.toString() || '',
        basePrice: product.basePrice?.toString() || '',
        basePrices: {
          pequena: (product.basePrices as any)?.pequena?.toString() || '',
          media: (product.basePrices as any)?.media?.toString() || '',
          grande: (product.basePrices as any)?.grande?.toString() || ''
        },
        images: product.images?.length ? product.images : [''],
        tags: product.tags || [],
        variants: product.variants || []
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      toast.error('Preencha nome e descrição');
      return;
    }

    setLoading(true);

    const productData: Partial<Product> = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      type: formData.type,
      images: formData.images.filter(img => img),
      tags: formData.tags,
      variants: formData.variants.length > 0 ? formData.variants : undefined
    };

    if (formData.price) {
      productData.price = parseFloat(formData.price);
    } else if (formData.basePrice) {
      productData.basePrice = parseFloat(formData.basePrice);
    } else if (formData.basePrices.pequena || formData.basePrices.media || formData.basePrices.grande) {
      productData.basePrices = {} as any;
      if (formData.basePrices.pequena) (productData.basePrices as any).pequena = parseFloat(formData.basePrices.pequena);
      if (formData.basePrices.media) (productData.basePrices as any).media = parseFloat(formData.basePrices.media);
      if (formData.basePrices.grande) (productData.basePrices as any).grande = parseFloat(formData.basePrices.grande);
    }

    try {
      if (product) {
        await updateProduct(product.id, productData);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await addProduct(productData);
        toast.success('Produto criado com sucesso!');
      }
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {product ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Nome *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg"
                >
                  <option value="pizzas">Pizzas</option>
                  <option value="bebidas">Bebidas</option>
                  <option value="sobremesas">Sobremesas</option>
                  <option value="combos">Combos</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Descrição *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg resize-none"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg"
                >
                  <option value="pizza">Pizza</option>
                  <option value="combo">Combo</option>
                  <option value="drink">Bebida</option>
                  <option value="dessert">Sobremesa</option>
                </select>
              </div>

              {formData.type === 'pizza' ? (
                <div>
                  <label className="block text-sm font-semibold mb-2">Preço Único</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold mb-2">Preço</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>

            {formData.type === 'pizza' && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Pequena</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.basePrices.pequena}
                    onChange={(e) => setFormData({
                      ...formData,
                      basePrices: { ...formData.basePrices, pequena: e.target.value }
                    })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Média</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.basePrices.media}
                    onChange={(e) => setFormData({
                      ...formData,
                      basePrices: { ...formData.basePrices, media: e.target.value }
                    })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Grande</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.basePrices.grande}
                    onChange={(e) => setFormData({
                      ...formData,
                      basePrices: { ...formData.basePrices, grande: e.target.value }
                    })}
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2">Imagem (URL)</label>
              <Input
                value={formData.images[0] || ''}
                onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                placeholder="https://..."
              />
            </div>

            {/* Variantes */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold">Variantes</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      variants: [
                        ...formData.variants,
                        {
                          name: `variante-${formData.variants.length + 1}`,
                          label: '',
                          values: []
                        }
                      ]
                    });
                  }}
                >
                  <Plus size={16} className="mr-1" />
                  Adicionar Variante
                </Button>
              </div>

              {formData.variants.map((variant, variantIdx) => (
                <div key={variantIdx} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm">Variante {variantIdx + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newVariants = formData.variants.filter((_, i) => i !== variantIdx);
                        setFormData({ ...formData, variants: newVariants });
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Nome (ID)</label>
                      <Input
                        value={variant.name}
                        onChange={(e) => {
                          const newVariants = [...formData.variants];
                          newVariants[variantIdx].name = e.target.value;
                          setFormData({ ...formData, variants: newVariants });
                        }}
                        placeholder="ex: sabores"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Label</label>
                      <Input
                        value={variant.label}
                        onChange={(e) => {
                          const newVariants = [...formData.variants];
                          newVariants[variantIdx].label = e.target.value;
                          setFormData({ ...formData, variants: newVariants });
                        }}
                        placeholder="ex: Sabor"
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* Valores da Variante */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-medium">Valores</label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newVariants = [...formData.variants];
                          newVariants[variantIdx].values.push({
                            value: '',
                            label: '',
                            description: '',
                            priceModifier: 0
                          });
                          setFormData({ ...formData, variants: newVariants });
                        }}
                        className="text-xs"
                      >
                        <Plus size={12} className="mr-1" />
                        Adicionar Valor
                      </Button>
                    </div>

                    {variant.values.map((value, valueIdx) => (
                      <div key={valueIdx} className="bg-gray-50 rounded p-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium mb-1">Valor (ID)</label>
                            <Input
                              value={value.value}
                              onChange={(e) => {
                                const newVariants = [...formData.variants];
                                newVariants[variantIdx].values[valueIdx].value = e.target.value;
                                setFormData({ ...formData, variants: newVariants });
                              }}
                              placeholder="ex: calabresa"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">Label</label>
                            <Input
                              value={value.label}
                              onChange={(e) => {
                                const newVariants = [...formData.variants];
                                newVariants[variantIdx].values[valueIdx].label = e.target.value;
                                setFormData({ ...formData, variants: newVariants });
                              }}
                              placeholder="ex: Calabresa"
                              className="text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Descrição</label>
                          <Input
                            value={value.description || ''}
                            onChange={(e) => {
                              const newVariants = [...formData.variants];
                              newVariants[variantIdx].values[valueIdx].description = e.target.value;
                              setFormData({ ...formData, variants: newVariants });
                            }}
                            placeholder="Descrição opcional da opção"
                            className="text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <label className="block text-xs font-medium mb-1">Modificador de Preço</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={value.priceModifier}
                              onChange={(e) => {
                                const newVariants = [...formData.variants];
                                newVariants[variantIdx].values[valueIdx].priceModifier = parseFloat(e.target.value) || 0;
                                setFormData({ ...formData, variants: newVariants });
                              }}
                              placeholder="0.00"
                              className="text-sm"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newVariants = [...formData.variants];
                              newVariants[variantIdx].values = newVariants[variantIdx].values.filter((_, i) => i !== valueIdx);
                              setFormData({ ...formData, variants: newVariants });
                            }}
                            className="text-red-600 hover:text-red-700 mt-6"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="flex-1"
              >
                {product ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

