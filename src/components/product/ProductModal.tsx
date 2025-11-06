import { useState } from 'react';
import { Minus, Plus, ShoppingCart, X } from 'lucide-react';
import { Product, PizzaSize, Addon } from '@/types/product';
import { useCartStore } from '@/store/useCartStore';
import { useProductStore } from '@/store/useProductStore';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductModal = ({ product, isOpen, onClose }: ProductModalProps) => {
  const addItem = useCartStore((state) => state.addItem);
  const getProductById = useProductStore((state) => state.getProductById);

  // Estado para pizza
  const [selectedSize, setSelectedSize] = useState<PizzaSize>('grande');
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);

  // Estado para combo
  const [comboItems] = useState(
    product.items?.map(item => ({
      ...item,
      selectedSize: item.defaultSize || 'grande' as PizzaSize,
      selectedFlavors: [] as string[]
    })) || []
  );

  // Adicionais
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);

  // Quantidade e notas
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  // Calcula preço
  const calculatePrice = (): number => {
    let price = 0;

    if (product.type === 'pizza' && product.basePrices) {
      price = product.basePrices[selectedSize] || 0;
    } else if (product.type === 'combo' && product.basePrice) {
      price = product.basePrice;
    } else if (product.price) {
      price = product.price;
    }

    // Adiciona preço dos adicionais
    if (selectedAddons.length > 0) {
      price += selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
    }

    return price;
  };

  const unitPrice = calculatePrice();
  const totalPrice = unitPrice * quantity;

  // Validação
  const canAddToCart = (): boolean => {
    if (product.type === 'pizza' && product.maxFlavors) {
      return selectedFlavors.length > 0 && selectedFlavors.length <= product.maxFlavors;
    }
    return true;
  };

  // Adicionar ao carrinho
  const handleAddToCart = () => {
    if (!canAddToCart()) {
      toast.error(`Selecione entre 1 e ${product.maxFlavors} sabor(es)`);
      return;
    }

    addItem({
      product,
      quantity,
      selectedSize: product.type === 'pizza' ? selectedSize : undefined,
      selectedFlavors: product.type === 'pizza' ? selectedFlavors : undefined,
      selectedAddons: selectedAddons.length > 0 ? selectedAddons : undefined,
      comboItems: product.type === 'combo' ? comboItems.map(item => {
        const itemProduct = getProductById(item.productId);
        return {
          productId: item.productId,
          product: itemProduct!,
          size: item.selectedSize,
          flavors: item.selectedFlavors,
          quantity: item.qty || 1
        };
      }) : undefined,
      unitPrice,
      notes: notes.trim() || undefined
    });

    toast.success('Produto adicionado ao carrinho!');
    onClose();
  };

  // Toggle flavor
  const toggleFlavor = (flavor: string) => {
    if (selectedFlavors.includes(flavor)) {
      setSelectedFlavors(selectedFlavors.filter(f => f !== flavor));
    } else {
      if (product.maxFlavors && selectedFlavors.length >= product.maxFlavors) {
        toast.error(`Máximo de ${product.maxFlavors} sabor(es)`);
        return;
      }
      setSelectedFlavors([...selectedFlavors, flavor]);
    }
  };

  // Toggle addon
  const toggleAddon = (addon: Addon) => {
    if (selectedAddons.find(a => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        {/* Imagem */}
        <div className="relative h-64 bg-gray-200 rounded-lg overflow-hidden mb-6">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ShoppingCart size={64} />
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Info */}
        <div>
          <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
          {product.description && (
            <p className="text-gray-600 mb-4">{product.description}</p>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex gap-2 mb-6">
              {product.tags.map(tag => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Seleção de tamanho (Pizza) */}
        {product.type === 'pizza' && product.basePrices && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Tamanho</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(product.basePrices).map(([size, price]) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size as PizzaSize)}
                  className={`
                    p-3 rounded-lg border-2 transition-all
                    ${selectedSize === size
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="font-semibold capitalize">{size}</div>
                  <div className="text-sm text-gray-600">{formatCurrency(price)}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Seleção de sabores (Pizza) */}
        {product.type === 'pizza' && product.flavors && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3">
              Sabores {product.maxFlavors && `(escolha até ${product.maxFlavors})`}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {product.flavors.map(flavor => (
                <button
                  key={flavor}
                  onClick={() => toggleFlavor(flavor)}
                  className={`
                    p-3 rounded-lg border-2 transition-all text-left
                    ${selectedFlavors.includes(flavor)
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  {flavor}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Adicionais */}
        {product.addons && product.addons.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Adicionais</h3>
            <div className="space-y-2">
              {product.addons.map(addon => (
                <button
                  key={addon.id}
                  onClick={() => toggleAddon(addon)}
                  disabled={!addon.available}
                  className={`
                    w-full p-3 rounded-lg border-2 transition-all flex justify-between items-center
                    ${selectedAddons.find(a => a.id === addon.id)
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                    ${!addon.available && 'opacity-50 cursor-not-allowed'}
                  `}
                >
                  <span>{addon.name}</span>
                  <span className="font-semibold">{formatCurrency(addon.price)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Observações */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Observações</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: sem cebola, bem assada..."
            className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
          />
        </div>

        {/* Quantidade e Adicionar */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Preço unitário</p>
              <p className="text-2xl font-bold text-primary-600">{formatCurrency(unitPrice)}</p>
            </div>

            {/* Controle de quantidade */}
            <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-white rounded transition-colors"
              >
                <Minus size={20} />
              </button>
              <span className="font-semibold w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 hover:bg-white rounded transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={!canAddToCart()}
            className="w-full"
            size="lg"
          >
            <ShoppingCart className="mr-2" size={20} />
            Adicionar ao carrinho - {formatCurrency(totalPrice)}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

