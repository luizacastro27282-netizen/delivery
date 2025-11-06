import { useState, useRef } from 'react';
import { Minus, Plus, ShoppingCart, X } from 'lucide-react';
import { Product, PizzaSize } from '@/types/product';
import { useCartStore } from '@/store/useCartStore';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface ProductModalWithSelectsProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductModalWithSelects = ({ product, isOpen, onClose }: ProductModalWithSelectsProps) => {
  const addItem = useCartStore((state) => state.addItem);

  // Refs para scroll automático
  const flavorRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const condimentsRef = useRef<HTMLDivElement>(null);
  const extrasRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);

  // Estado para pizza
  const [selectedSize] = useState<PizzaSize>('media');
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  
  // Estado para borda
  const [selectedBorder, setSelectedBorder] = useState<string>('sem-borda');
  
  // Estado para condimentos (múltipla escolha)
  const [wantsMustard, setWantsMustard] = useState(true);
  const [wantsKetchup, setWantsKetchup] = useState(false);
  
  // Estado para extras
  const [wantsExtraSauce, setWantsExtraSauce] = useState(false);

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

    // Adiciona preço da borda
    if (selectedBorder === 'catupiry') price += 6.00;
    if (selectedBorder === 'cheddar') price += 6.00;
    if (selectedBorder === 'cheddar-chocolate-preto') price += 8.00;
    if (selectedBorder === 'cheddar-chocolate-branco') price += 8.00;
    
    // Adiciona extra
    if (wantsExtraSauce) price += 3.00;

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
      toast.error(`Selecione pelo menos 1 sabor`);
      return;
    }

    addItem({
      product,
      quantity,
      selectedSize: product.type === 'pizza' ? selectedSize : undefined,
      selectedFlavors: product.type === 'pizza' ? selectedFlavors : undefined,
      unitPrice,
      notes: notes.trim() || undefined
    });

    toast.success('Produto adicionado ao carrinho!');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="relative">
        {/* Imagem */}
        <div className="relative h-64 bg-gray-200">
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

        {/* Conteúdo */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Título */}
          <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
          <p className="text-sm text-gray-500 mb-4">* Foto meramente ilustrativo</p>
          <p className="text-2xl font-bold text-primary-600 mb-6">
            {formatCurrency(unitPrice)}
          </p>

          {/* Sabor - SELECT */}
          {product.type === 'pizza' && product.flavors && (
            <div className="mb-6" ref={flavorRef}>
              <label className="block text-sm font-semibold mb-2">
                Escolha o sabor
              </label>
              <p className="text-xs text-gray-500 mb-2">Escolha 1 opção</p>
              <p className="text-xs text-gray-600 mb-3">
                O valor final será baseado na opção de maior valor
              </p>
              
              <select
                value={selectedFlavors[0] || ''}
                onChange={(e) => {
                  setSelectedFlavors([e.target.value]);
                  scrollToSection(borderRef);
                }}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
              >
                <option value="">Selecione um sabor</option>
                {product.flavors.map(flavor => (
                  <option key={flavor} value={flavor}>
                    {flavor}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Borda - SELECT */}
          <div className="mb-6" ref={borderRef}>
            <label className="block text-sm font-semibold mb-2">
              Deseja borda na pizza?
            </label>
            <p className="text-xs text-gray-500 mb-3">Escolha 1 opção • OBRIGATÓRIO</p>
            
            <select
              value={selectedBorder}
              onChange={(e) => {
                setSelectedBorder(e.target.value);
                scrollToSection(condimentsRef);
              }}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
            >
              <option value="sem-borda">SEM BORDA</option>
              <option value="catupiry">Borda de Catupiry + R$ 6,00</option>
              <option value="cheddar">Borda de Cheddar + R$ 6,00</option>
              <option value="cheddar-chocolate-preto">Borda Cheddar Original + Chocolate Preto + R$ 8,00</option>
              <option value="cheddar-chocolate-branco">Borda Cheddar Original + Chocolate Branco + R$ 8,00</option>
            </select>
          </div>

          {/* Condimentos - CHECKBOXES */}
          <div className="mb-6" ref={condimentsRef}>
            <label className="block text-sm font-semibold mb-2">
              Deseja Ketchup ou mostarda?
            </label>
            <p className="text-xs text-gray-500 mb-3">Escolha de 1 a 2 opções</p>
            
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-all">
                <input
                  type="checkbox"
                  checked={wantsMustard}
                  onChange={(e) => {
                    setWantsMustard(e.target.checked);
                    if (e.target.checked) scrollToSection(extrasRef);
                  }}
                  className="w-5 h-5 accent-primary-600"
                />
                <span>Sim, desejo mostarda</span>
              </label>
              
              <label className="flex items-center gap-3 p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-all">
                <input
                  type="checkbox"
                  checked={wantsKetchup}
                  onChange={(e) => {
                    setWantsKetchup(e.target.checked);
                    if (e.target.checked) scrollToSection(extrasRef);
                  }}
                  className="w-5 h-5 accent-primary-600"
                />
                <span>Sim, desejo ketchup</span>
              </label>
              
              <label className="flex items-center gap-3 p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-all">
                <input
                  type="checkbox"
                  checked={!wantsMustard && !wantsKetchup}
                  onChange={() => {
                    setWantsMustard(false);
                    setWantsKetchup(false);
                    scrollToSection(extrasRef);
                  }}
                  className="w-5 h-5 accent-primary-600"
                />
                <span>sem ketchup e s/ mostarda</span>
              </label>
            </div>
          </div>

          {/* Extras - SELECT */}
          <div className="mb-6" ref={extrasRef}>
            <label className="block text-sm font-semibold mb-2">
              Deseja molho extra? (vai com 4 unidades)
            </label>
            <p className="text-xs text-gray-500 mb-3">Escolha até 1 opção</p>
            
            <select
              value={wantsExtraSauce ? 'sim' : 'nao'}
              onChange={(e) => {
                setWantsExtraSauce(e.target.value === 'sim');
                scrollToSection(notesRef);
              }}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
            >
              <option value="nao">Não, obrigado</option>
              <option value="sim">desejo molho extra + R$ 3,00</option>
            </select>
          </div>

          {/* Observações */}
          <div className="mb-6" ref={notesRef}>
            <label className="block text-sm font-semibold mb-2">
              Alguma observação?
            </label>
            <p className="text-xs text-gray-500 mb-2">0 / 140</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={140}
              placeholder="Ex: sem cebola, bem assada..."
              className="w-full p-3 border-2 border-gray-300 rounded-lg resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
              rows={4}
            />
          </div>
        </div>

        {/* Footer fixo */}
        <div className="sticky bottom-0 bg-white border-t p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
          {/* Controle de quantidade */}
          <div className="flex items-center gap-1 sm:gap-3 bg-gray-100 rounded-lg p-1">
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
    </Modal>
  );
};

