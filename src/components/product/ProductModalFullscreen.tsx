import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, ShoppingCart, X, ChevronLeft } from 'lucide-react';
import { Product, PizzaSize, SelectedVariant } from '@/types/product';
import { useCartStore } from '@/store/useCartStore';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';

interface ProductModalFullscreenProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductModalFullscreen = ({ product, isOpen, onClose }: ProductModalFullscreenProps) => {
  const addItem = useCartStore((state) => state.addItem);

  // Estado do produto carregado da API (com variantes)
  const [fullProduct, setFullProduct] = useState<Product>(product);
  const [loadingProduct, setLoadingProduct] = useState(false);

  // Refs para scroll automático
  const flavorRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const condimentsRef = useRef<HTMLDivElement>(null);
  const extrasRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);

  // Estado para pizza
  const [selectedSize, setSelectedSize] = useState<PizzaSize>('media');
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  
  // Estado para borda
  const [selectedBorder, setSelectedBorder] = useState<string>('sem-borda');
  
  // Estado para condimentos
  const [selectedCondiments, setSelectedCondiments] = useState<string[]>(['mostarda']);
  
  // Estado para extras
  const [wantsExtraSauce, setWantsExtraSauce] = useState(false);

  // Estado para variantes
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [selectedPizzaFlavors, setSelectedPizzaFlavors] = useState<string[]>([]); // Para variantes de pizza com múltiplos sabores

  // Quantidade e notas
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  // Buscar produto completo da API quando o modal abrir
  useEffect(() => {
    if (isOpen && product.id) {
      const fetchProduct = async () => {
        setLoadingProduct(true);
        try {
          const response = await api.get<{ product: Product }>(`/products/${product.id}`, {
            requiresAuth: false
          });
          
          if (response?.product) {
            setFullProduct(response.product);
          }
        } catch (error) {
          console.error('Erro ao carregar produto:', error);
          // Em caso de erro, usar o produto passado como prop
          setFullProduct(product);
        } finally {
          setLoadingProduct(false);
        }
      };

      fetchProduct();
    } else {
      // Resetar para o produto inicial quando o modal fechar
      setFullProduct(product);
      setSelectedVariants({});
      setSelectedPizzaFlavors([]);
      setSelectedSize('media');
      setSelectedFlavors([]);
      setSelectedBorder('sem-borda');
      setSelectedCondiments(['mostarda']);
      setWantsExtraSauce(false);
      setQuantity(1);
      setNotes('');
    }
  }, [isOpen, product.id]);

  // Handler para mudança de variante
  const handleVariantChange = (variantName: string, value: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantName]: value
    }));
  };

  // Handler para variantes de pizza com múltiplos sabores
  const handlePizzaFlavorToggle = (_variantName: string, value: string) => {
    setSelectedPizzaFlavors(prev => {
      if (prev.includes(value)) {
        return prev.filter(v => v !== value);
      } else if (prev.length < 2) {
        return [...prev, value];
      }
      return prev;
    });
  };

  // Calcula preço
  const calculatePrice = (): number => {
    let price = 0;

    if (fullProduct.type === 'pizza' && fullProduct.basePrices) {
      price = fullProduct.basePrices[selectedSize] || 0;
    } else if (fullProduct.type === 'combo' && fullProduct.basePrice) {
      price = fullProduct.basePrice;
    } else if (fullProduct.price) {
      price = fullProduct.price;
    }

    // Adiciona modificadores de preço das variantes
    if (fullProduct.variants) {
      fullProduct.variants.forEach(variant => {
        // Se é uma variante de Pizza com múltiplos sabores (aceita "Pizza", "Pizza 1", "Pizza 2", etc)
        const isPizzaVariant = variant.label.toLowerCase().startsWith('pizza');
        if (isPizzaVariant && selectedPizzaFlavors.length > 0) {
          // Pegar o maior priceModifier dos sabores selecionados
          const maxModifier = selectedPizzaFlavors.reduce((max, flavorValue) => {
            const option = variant.values.find(v => v.value === flavorValue);
            const modifier = option?.priceModifier || 0;
            return Math.max(max, modifier);
          }, 0);
          price += maxModifier;
        } else {
          const selectedValue = selectedVariants[variant.name];
          if (selectedValue) {
            const option = variant.values.find(v => v.value === selectedValue);
            if (option) {
              price += option.priceModifier || 0;
            }
          }
        }
      });
    }

    // Adiciona preço da borda e extras apenas para pizzas
    if (fullProduct.type === 'pizza') {
      if (selectedBorder === 'catupiry') price += 6.00;
      if (selectedBorder === 'cheddar') price += 6.00;
      if (selectedBorder === 'cheddar-chocolate-preto') price += 8.00;
      if (selectedBorder === 'cheddar-chocolate-branco') price += 8.00;
      
      // Adiciona extra
      if (wantsExtraSauce) price += 3.00;
    }

    return price;
  };

  const unitPrice = calculatePrice();
  const totalPrice = unitPrice * quantity;

  // Scroll automático ao selecionar
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };

  // Toggle condimentos
  const toggleCondiment = (condiment: string) => {
    setSelectedCondiments(prev => {
      if (condiment === 'nenhum') return [];
      const newCondiments = prev.filter(c => c !== 'nenhum');
      if (prev.includes(condiment)) {
        return newCondiments.filter(c => c !== condiment);
      }
      return [...newCondiments, condiment];
    });
  };

  // Validação
  const canAddToCart = (): boolean => {
    // Validar variantes obrigatórias
    if (fullProduct.variants) {
      for (const variant of fullProduct.variants) {
        // Se é uma variante de Pizza, validar selectedPizzaFlavors (aceita "Pizza", "Pizza 1", "Pizza 2", etc)
        const isPizzaVariant = variant.label.toLowerCase().startsWith('pizza');
        if (isPizzaVariant) {
          if (selectedPizzaFlavors.length === 0) {
            return false;
          }
        } else if (!selectedVariants[variant.name]) {
          return false;
        }
      }
    }

    if (fullProduct.type === 'pizza' && fullProduct.maxFlavors) {
      return selectedFlavors.length > 0 && selectedFlavors.length <= fullProduct.maxFlavors;
    }
    return true;
  };

  // Adicionar ao carrinho
  const handleAddToCart = () => {
    if (!canAddToCart()) {
      // Verificar se há variante de Pizza sem seleção
      const pizzaVariant = fullProduct.variants?.find(v => v.label === 'Pizza');
      if (pizzaVariant && selectedPizzaFlavors.length === 0) {
        toast.error('Selecione pelo menos 1 sabor de pizza');
        return;
      }
      
      if (fullProduct.variants && fullProduct.variants.some(v => v.label !== 'Pizza' && !selectedVariants[v.name])) {
        toast.error('Selecione todas as opções obrigatórias');
      } else if (fullProduct.type === 'pizza' && fullProduct.maxFlavors) {
        toast.error(`Selecione pelo menos 1 sabor`);
      }
      return;
    }

    // Preparar selectedVariant para o carrinho
    // Se houver variante de Pizza, usar os sabores selecionados
    const pizzaVariant = fullProduct.variants?.find(v => v.label === 'Pizza');
    const selectedVariant: SelectedVariant | undefined = fullProduct.variants && fullProduct.variants.length > 0
      ? pizzaVariant
        ? {
            variantName: pizzaVariant.name,
            value: selectedPizzaFlavors.join(', ') // Combinar os sabores selecionados
          }
        : {
            variantName: fullProduct.variants[0].name,
            value: selectedVariants[fullProduct.variants[0].name]
          }
      : undefined;

    addItem({
      product: fullProduct,
      quantity,
      selectedSize: fullProduct.type === 'pizza' ? selectedSize : undefined,
      selectedFlavors: fullProduct.type === 'pizza' ? selectedFlavors : undefined,
      selectedVariant,
      unitPrice,
      notes: notes.trim() || undefined
    });

    toast.success('Produto adicionado ao carrinho!');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 bg-white z-[100] flex flex-col md:max-w-2xl md:mx-auto"
        >
          {/* Header fixo */}
          <div className="bg-white border-b sticky top-0 z-10">
            <div className="flex items-center p-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft size={24} />
              </button>
              <h2 className="text-lg font-bold ml-2 flex-1">{fullProduct.name}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Conteúdo scrollável */}
          <div className="flex-1 overflow-y-auto pb-32">
            {loadingProduct ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <>
                {/* Imagem */}
                <div className="relative h-64 bg-gray-200">
                  {fullProduct.images && fullProduct.images[0] ? (
                    <img
                      src={fullProduct.images[0]}
                      alt={fullProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ShoppingCart size={64} />
                    </div>
                  )}
                </div>

                {/* Info do produto */}
                <div className="p-4 bg-gray-50 border-b">
                  <h3 className="text-xl font-bold mb-2">{fullProduct.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">* Foto meramente ilustrativa</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {formatCurrency(unitPrice)}
                  </p>
                </div>

                <div className="p-4 space-y-6">
                  {/* Variantes */}
                  {fullProduct.variants && fullProduct.variants.length > 0 && (
                    <div>
                      {fullProduct.variants.map((variant) => (
                        <div key={variant.name} className="mb-6">
                          <h4 className="font-bold text-lg mb-1">{variant.label}</h4>
                          
                          {/* Se é variante de Pizza, permite múltipla seleção (aceita "Pizza", "Pizza 1", "Pizza 2", etc) */}
                          {variant.label.toLowerCase().startsWith('pizza') ? (
                            <>
                              <p className="text-sm text-gray-500 mb-1">Escolha até 2 opções • Mínimo 1</p>
                              <p className="text-xs text-gray-600 mb-4">
                                O valor final será baseado na opção de maior valor
                              </p>
                              
                              <div className="space-y-2">
                                {variant.values.map((option) => {
                                  const isSelected = selectedPizzaFlavors.includes(option.value);
                                  const canSelect = selectedPizzaFlavors.length < 2 || isSelected;
                                  
                                  return (
                                    <label
                                      key={option.value}
                                      className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                        isSelected
                                          ? 'border-primary-600 bg-primary-50'
                                          : canSelect
                                          ? 'border-gray-300 hover:border-gray-400'
                                          : 'border-gray-200 opacity-50 cursor-not-allowed'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          disabled={!canSelect}
                                          onChange={() => {
                                            handlePizzaFlavorToggle(variant.name, option.value);
                                            
                                            // Só faz scroll automático quando selecionar o 2º sabor
                                            const newCount = isSelected ? selectedPizzaFlavors.length - 1 : selectedPizzaFlavors.length + 1;
                                            if (newCount === 2) {
                                              if (fullProduct.type === 'pizza') {
                                                scrollToSection(borderRef);
                                              } else {
                                                scrollToSection(notesRef);
                                              }
                                            }
                                          }}
                                          className="w-5 h-5 accent-primary-600"
                                        />
                                        <div>
                                          <span className="font-medium">{option.label}</span>
                                          {option.description && (
                                            <p className="text-xs text-gray-500 italic mt-1">
                                              {option.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      {option.priceModifier !== 0 && (
                                        <span className="text-sm text-gray-600">
                                          {option.priceModifier > 0 ? '+' : ''}
                                          {formatCurrency(option.priceModifier)}
                                        </span>
                                      )}
                                    </label>
                                  );
                                })}
                              </div>
                            </>
                          ) : (
                            <>
                              <p className="text-sm text-gray-500 mb-4">Escolha 1 opção • OBRIGATÓRIO</p>
                              
                              <div className="space-y-2">
                                {variant.values.map((option) => (
                                  <label
                                    key={option.value}
                                    className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                      selectedVariants[variant.name] === option.value
                                        ? 'border-primary-600 bg-primary-50'
                                        : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <input
                                        type="radio"
                                        name={variant.name}
                                        value={option.value}
                                        checked={selectedVariants[variant.name] === option.value}
                                        onChange={(e) => {
                                          handleVariantChange(variant.name, e.target.value);
                                          // Scroll para próxima seção baseado no tipo de produto
                                          if (fullProduct.type === 'pizza') {
                                            scrollToSection(borderRef);
                                          } else {
                                            scrollToSection(notesRef);
                                          }
                                        }}
                                        className="w-5 h-5 accent-primary-600"
                                      />
                                      <div>
                                        <span className="font-medium">{option.label}</span>
                                        {option.description && (
                                          <p className="text-xs text-gray-500 italic mt-1">
                                            {option.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    {option.priceModifier !== 0 && (
                                      <span className="text-sm text-gray-600">
                                        {option.priceModifier > 0 ? '+' : ''}
                                        {formatCurrency(option.priceModifier)}
                                      </span>
                                    )}
                                  </label>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sabores - RADIO */}
                  {fullProduct.type === 'pizza' && fullProduct.flavors && (
                <div ref={flavorRef}>
                  <h4 className="font-bold text-lg mb-1">Escolha o sabor</h4>
                  <p className="text-sm text-gray-500 mb-1">Escolha 1 opção</p>
                  <p className="text-xs text-gray-600 mb-4">
                    O valor final será baseado na opção de maior valor
                  </p>
                  
                    <div className="space-y-2">
                      {fullProduct.flavors.map((flavor) => (
                        <label
                          key={flavor}
                          className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedFlavors[0] === flavor
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name="flavor"
                            value={flavor}
                            checked={selectedFlavors[0] === flavor}
                            onChange={(e) => {
                              setSelectedFlavors([e.target.value]);
                              scrollToSection(borderRef);
                            }}
                            className="w-5 h-5 accent-primary-600"
                          />
                          <span className="font-medium">{flavor}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

              {/* Borda - RADIO - Apenas para pizzas */}
              {fullProduct.type === 'pizza' && (
                <div ref={borderRef}>
                  <h4 className="font-bold text-lg mb-1">Deseja borda na pizza?</h4>
                  <p className="text-sm text-gray-500 mb-4">Escolha 1 opção • OBRIGATÓRIO</p>
                  
                  <div className="space-y-2">
                    {[
                      { value: 'sem-borda', label: 'SEM BORDA', price: 0 },
                      { value: 'catupiry', label: 'Borda de Catupiry', price: 6 },
                      { value: 'cheddar', label: 'Borda de Cheddar', price: 6 },
                      { value: 'cheddar-chocolate-preto', label: 'Borda Cheddar + Chocolate Preto', price: 8 },
                      { value: 'cheddar-chocolate-branco', label: 'Borda Cheddar + Chocolate Branco', price: 8 }
                    ].map((border) => (
                      <label
                        key={border.value}
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedBorder === border.value
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="border"
                            value={border.value}
                            checked={selectedBorder === border.value}
                            onChange={(e) => {
                              setSelectedBorder(e.target.value);
                              scrollToSection(condimentsRef);
                            }}
                            className="w-5 h-5 accent-primary-600"
                          />
                          <span className="font-medium">{border.label}</span>
                        </div>
                        {border.price > 0 && (
                          <span className="text-sm text-gray-600">
                            + {formatCurrency(border.price)}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Condimentos - CHECKBOX (múltipla escolha) - Apenas para pizzas */}
              {fullProduct.type === 'pizza' && (
                <div ref={condimentsRef}>
                  <h4 className="font-bold text-lg mb-1">Deseja Ketchup ou mostarda?</h4>
                  <p className="text-sm text-gray-500 mb-4">Escolha de 1 a 2 opções</p>
                  
                  <div className="space-y-2">
                    {[
                      { value: 'mostarda', label: 'Sim, desejo mostarda' },
                      { value: 'ketchup', label: 'Sim, desejo ketchup' },
                      { value: 'nenhum', label: 'sem ketchup e s/ mostarda' }
                    ].map((condiment) => (
                      <label
                        key={condiment.value}
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          (condiment.value === 'nenhum' && selectedCondiments.length === 0) ||
                          (condiment.value !== 'nenhum' && selectedCondiments.includes(condiment.value))
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={
                            condiment.value === 'nenhum'
                              ? selectedCondiments.length === 0
                              : selectedCondiments.includes(condiment.value)
                          }
                          onChange={() => {
                            toggleCondiment(condiment.value);
                            scrollToSection(extrasRef);
                          }}
                          className="w-5 h-5 accent-primary-600"
                        />
                        <span className="font-medium">{condiment.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Extras - RADIO - Apenas para pizzas */}
              {fullProduct.type === 'pizza' && (
                <div ref={extrasRef}>
                  <h4 className="font-bold text-lg mb-1">Deseja molho extra?</h4>
                  <p className="text-sm text-gray-500 mb-4">vai com 4 unidades • Escolha até 1 opção</p>
                  
                  <div className="space-y-2">
                    {[
                      { value: false, label: 'Não, obrigado', price: 0 },
                      { value: true, label: 'desejo molho extra', price: 3 }
                    ].map((option) => (
                      <label
                        key={String(option.value)}
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          wantsExtraSauce === option.value
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="extra"
                            checked={wantsExtraSauce === option.value}
                            onChange={() => {
                              setWantsExtraSauce(option.value);
                              scrollToSection(notesRef);
                            }}
                            className="w-5 h-5 accent-primary-600"
                          />
                          <span className="font-medium">{option.label}</span>
                        </div>
                        {option.price > 0 && (
                          <span className="text-sm text-gray-600">
                            + {formatCurrency(option.price)}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Observações */}
              <div ref={notesRef}>
                <h4 className="font-bold text-lg mb-1">Alguma observação?</h4>
                <p className="text-sm text-gray-500 mb-3">{notes.length} / 140</p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={140}
                  placeholder="Ex: sem cebola, bem assada..."
                  className="w-full p-4 border-2 border-gray-300 rounded-lg resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                  rows={4}
                />
              </div>
            </div>
            </>
            )}
          </div>

          {/* Footer fixo */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-3 sm:p-4 md:max-w-2xl md:mx-auto z-[101]">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Controle de quantidade */}
              <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 sm:p-2 hover:bg-white rounded transition-colors"
                >
                  <Minus size={18} className="sm:w-5 sm:h-5" />
                </button>
                <span className="font-semibold w-6 sm:w-8 text-center text-sm sm:text-base">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1.5 sm:p-2 hover:bg-white rounded transition-colors"
                >
                  <Plus size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Botão adicionar */}
              <Button
                onClick={handleAddToCart}
                disabled={!canAddToCart()}
                className="flex-1 text-sm sm:text-base px-3 sm:px-4"
                size="lg"
              >
                <span className="hidden xs:inline">Adicionar</span>
                <span className="xs:hidden">Add</span>
                <span className="ml-auto font-bold text-sm sm:text-base">{formatCurrency(totalPrice)}</span>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

