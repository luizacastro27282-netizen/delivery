import { useState } from 'react';
import { motion } from 'framer-motion';
import { Product, ProductVariant, SelectedVariant } from '@/types/product';
import { formatCurrency } from '@/lib/utils';

interface OrderBumpItem {
  productId: string;
  desconto: number;
  descontoTipo: 'percent' | 'fixed';
  ativo: boolean;
  product: Product;
}

interface OrderBumpCardProps {
  orderBump: OrderBumpItem;
  onAdd: (product: Product, selectedVariant: SelectedVariant | undefined, finalPrice: number) => void;
}

export const OrderBumpCard = ({ orderBump, onAdd }: OrderBumpCardProps) => {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const { product, desconto, descontoTipo } = orderBump;
  const hasVariants = product.variants && product.variants.length > 0;
  const hasDiscount = desconto > 0;

  // Calcular preço real do produto com as variantes selecionadas
  let realPrice = product.price || product.basePrice || 0;
  
  // Se tem variantes selecionadas, aplicar os modificadores
  if (hasVariants && product.variants) {
    product.variants.forEach((variant: ProductVariant) => {
      const selectedValue = selectedVariants[variant.name];
      if (selectedValue) {
        const option = variant.values.find(v => v.value === selectedValue);
        if (option && option.priceModifier) {
          realPrice += option.priceModifier;
        }
      }
    });
  }

  // Este é o preço SEM desconto (para mostrar "De R$ X")
  const priceBeforeDiscount = realPrice;

  // Aplicar o desconto sobre o preço REAL (com variantes)
  let finalPrice = realPrice;
  if (hasDiscount && desconto > 0) {
    if (descontoTipo === 'percent') {
      finalPrice = realPrice * (1 - desconto / 100);
    } else {
      finalPrice = Math.max(0, realPrice - desconto);
    }
  }

  const handleVariantChange = (variantName: string, value: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantName]: value
    }));
  };

  const handleAdd = () => {
    // Validar se todas as variantes foram selecionadas
    if (hasVariants && product.variants) {
      const allVariantsSelected = product.variants.every(variant => 
        variant.values.length > 0 && selectedVariants[variant.name]
      );

      if (!allVariantsSelected) {
        alert('Por favor, selecione todas as opções antes de adicionar ao pedido');
        return;
      }
    }

    // Criar selectedVariant (backend suporta uma variante por vez)
    // Se houver múltiplas variantes, enviamos a primeira selecionada
    let selectedVariant: SelectedVariant | undefined;
    if (hasVariants && product.variants && Object.keys(selectedVariants).length > 0) {
      // Priorizar a primeira variante na ordem do array
      const firstVariant = product.variants.find(v => selectedVariants[v.name]);
      if (firstVariant) {
        selectedVariant = {
          variantName: firstVariant.name,
          value: selectedVariants[firstVariant.name]
        };
      }
    }

    onAdd(product, selectedVariant, finalPrice);
    
    // Reset seleções após adicionar
    setSelectedVariants({});
  };

  const allVariantsSelected = hasVariants && product.variants
    ? product.variants.every(variant => 
        variant.values.length > 0 && selectedVariants[variant.name]
      )
    : true;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all text-left relative"
    >
      {/* Badge de Desconto */}
      {hasDiscount && (
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
          {descontoTipo === 'percent' 
            ? `${desconto}% OFF`
            : `${formatCurrency(desconto)} OFF`}
        </div>
      )}

      {/* Imagem */}
      <div className="aspect-square bg-gray-200 rounded-lg mb-2 overflow-hidden relative">
        {product.images && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-2xl">🍕</span>
          </div>
        )}
      </div>

      {/* Nome */}
      <h4 className="text-sm font-semibold mb-2 line-clamp-2">
        {product.name}
      </h4>

      {/* Variantes */}
      {hasVariants && product.variants && (
        <div className="space-y-2 mb-3">
          {product.variants.map((variant: ProductVariant) => (
            <div key={variant.name}>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                {variant.label}:
              </label>
              <select
                value={selectedVariants[variant.name] || ''}
                onChange={(e) => handleVariantChange(variant.name, e.target.value)}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Selecione {variant.label}</option>
                {variant.values.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                    {option.priceModifier !== 0 && (
                      option.priceModifier > 0 
                        ? ` (+${formatCurrency(option.priceModifier)})`
                        : ` (${formatCurrency(option.priceModifier)})`
                    )}
                  </option>
                ))}
              </select>
              {/* Exibir descrição da opção selecionada */}
              {selectedVariants[variant.name] && (() => {
                const selectedOption = variant.values.find(v => v.value === selectedVariants[variant.name]);
                return selectedOption?.description ? (
                  <p className="text-xs text-gray-500 mt-1 italic">
                    {selectedOption.description}
                  </p>
                ) : null;
              })()}
            </div>
          ))}
        </div>
      )}

      {/* Preço */}
      <div className="flex flex-col mb-3">
        {hasDiscount && priceBeforeDiscount > finalPrice && (
          <p className="text-xs text-gray-500 line-through">
            De {formatCurrency(priceBeforeDiscount)}
          </p>
        )}
        <p className={`font-bold text-sm ${hasDiscount ? 'text-green-600' : 'text-primary-600'}`}>
          {hasDiscount ? 'Por' : ''} {formatCurrency(finalPrice)}
        </p>
      </div>

      {/* Botão Adicionar */}
      <button
        onClick={handleAdd}
        disabled={!allVariantsSelected}
        className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
          allVariantsSelected
            ? 'bg-primary-600 text-white hover:bg-primary-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {allVariantsSelected ? 'Adicionar' : 'Selecione as opções'}
      </button>
    </motion.div>
  );
};

