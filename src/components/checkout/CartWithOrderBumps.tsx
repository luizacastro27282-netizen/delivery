import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Percent, Truck, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useProductStore } from '@/store/useProductStore';
import { useCartStore } from '@/store/useCartStore';
import { useConfigStore } from '@/store/useConfigStore';
import { CartItemCard } from './CartItemCard';
import { CouponInput } from './CouponInput';
import { OrderBumpCard } from './OrderBumpCard';
import { formatCurrency } from '@/lib/utils';
import { Product, SelectedVariant } from '@/types/product';
import { api } from '@/lib/api';

export const CartWithOrderBumps = () => {
  const navigate = useNavigate();
  const cart = useCart();
  const { products, loadProducts } = useProductStore();
  const { addItem } = useCartStore();
  const { config, loadConfig, isStoreOpen, getOpeningMessage } = useConfigStore();
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [fetchedProducts, setFetchedProducts] = useState<Record<string, Product>>({});

  if (!cart) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const { items, summary, clearCart, removeCoupon, appliedCoupon } = cart;

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    if (!products || products.length === 0) {
      loadProducts();
    }
  }, [products, loadProducts]);

  // Buscar por ID os produtos de order bump que não estiverem em cache
  useEffect(() => {
    const loadMissing = async () => {
      try {
        const ob = config?.orderBumps;
        if (!ob?.enabled || !ob?.itens || ob.itens.length === 0) return;

        const ids = ob.itens.filter(i => i.ativo && i.productId).map(i => i.productId);
        const missing = ids.filter(id => !products.find(p => p.id === id) && !fetchedProducts[id]);
        if (missing.length === 0) return;

        const results = await Promise.allSettled(
          missing.map(id => api.get<{ product: Product }>(`/products/${id}`, { requiresAuth: false }))
        );

        const map: Record<string, Product> = {};
        results.forEach((res, idx) => {
          if (res.status === 'fulfilled') {
            const data = res.value as any;
            const product = (data.product || data) as Product;
            if (product?.id) {
              map[product.id] = product;
            } else if (missing[idx]) {
              // Fallback: usar o ID original se product não tiver id
              map[missing[idx]] = product;
            }
          }
        });
        if (Object.keys(map).length > 0) {
          setFetchedProducts(prev => ({ ...prev, ...map }));
        }
      } catch (e) {
        console.error('Erro buscando produtos do order bump:', e);
      }
    };

    loadMissing();
  }, [config, products, fetchedProducts]);

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  let storeOpen = false;
  let openingMessage = '';
  try {
    storeOpen = isStoreOpen ? isStoreOpen() : false;
    openingMessage = getOpeningMessage ? getOpeningMessage() : '';
  } catch (error) {
    console.error('Erro ao obter status da loja:', error);
  }

  // Produtos sugeridos baseados na config (agora vem enriquecido do backend)
  const suggestedProducts = useMemo(() => {
    try {
      const ob = config?.orderBumps;
      if (!ob?.enabled || !ob?.itens || ob.itens.length === 0) {
        return [];
      }

      // O backend agora retorna product completo com variants
      const list = (ob.itens || [])
        .filter((item: any) => item.ativo && (item.productId || item.product))
        .map((item: any) => {
          // Se já tem product enriquecido do backend, usar
          if (item.product) {
            return item;
          }

          // Fallback: buscar no store ou fetchedProducts
          const product = products.find(p => p.id === item.productId) || fetchedProducts[item.productId];
          if (!product) return null;

          return {
            ...item,
            product
          };
        })
        .filter((x: any) => x !== null && x.product)
        .slice(0, ob.quantidade || 3);

      return list;
    } catch (error) {
      console.error('Erro ao montar produtos sugeridos:', error);
      return [];
    }
  }, [config, products, fetchedProducts]);

  // Adicionar produto sugerido (com variante e desconto aplicado)
  const handleAddOrderBump = (product: Product, selectedVariant: SelectedVariant | undefined, finalPrice: number) => {
    addItem({
      product,
      quantity: 1,
      unitPrice: finalPrice,
      selectedVariant
    });
  };

  // Calcular progresso para frete grátis
  const freeDeliveryThreshold = (config as any)?.freeDeliveryAbove || 50;
  const subtotalValue = summary?.subtotal || 0;
  const progressPercent = Math.min((subtotalValue / freeDeliveryThreshold) * 100, 100);
  const remaining = Math.max(freeDeliveryThreshold - subtotalValue, 0);
  const hasFreeDelivery = subtotalValue >= freeDeliveryThreshold;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h2 className="text-xl font-bold">{config.store.name}</h2>
          <button onClick={() => navigate('/')} className="text-gray-600">
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Itens do carrinho */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">Sua sacola</h3>
            {items.length > 0 && (
              <button 
                onClick={() => clearCart()}
                className="text-primary-600 text-sm font-semibold"
              >
                LIMPAR
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-500 mb-4">Seu carrinho está vazio</p>
              <button
                onClick={() => navigate('/')}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Ver Cardápio
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <CartItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Order Bumps - Produtos Sugeridos */}
        {suggestedProducts && suggestedProducts.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3">{config?.orderBumps?.titulo || 'Você também pode gostar'}</h3>
          
            <div className="grid grid-cols-3 gap-3">
              {suggestedProducts.map((orderBump: any) => (
                <OrderBumpCard
                  key={orderBump.productId || orderBump.product?.id}
                  orderBump={orderBump}
                  onAdd={handleAddOrderBump}
                />
              ))}
            </div>
          </div>
        )}

        {/* Progress Bar - Frete Grátis */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Truck size={20} className={hasFreeDelivery ? 'text-green-600' : 'text-gray-400'} />
            <p className="text-sm font-semibold">
              {hasFreeDelivery ? (
                <span className="text-green-600">
                  <Check size={16} className="inline" /> Você ganhou entrega gratuita!
                </span>
              ) : (
                <span className="text-gray-700">
                  Faltam <strong>{formatCurrency(remaining)}</strong> para entrega gratuita
                </span>
              )}
            </p>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full rounded-full ${
                hasFreeDelivery ? 'bg-green-500' : 'bg-primary-600'
              }`}
            />
          </div>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            Frete grátis em compras acima de {formatCurrency(freeDeliveryThreshold)}
          </p>
        </div>

        {/* Resumo */}
        <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold">{formatCurrency(summary.subtotal)}</span>
          </div>

          {summary.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Desconto</span>
              <span>-{formatCurrency(summary.discount)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Taxa de entrega</span>
            <span className={hasFreeDelivery ? 'text-green-600 font-semibold' : 'text-gray-600'}>
              {hasFreeDelivery ? 'Grátis' : formatCurrency(config?.store?.taxaEntrega || 5)}
            </span>
          </div>

          <div className="border-t pt-3 flex justify-between">
            <span className="font-bold text-lg">Total</span>
            <span className="font-bold text-lg text-primary-600">
              {formatCurrency(summary.subtotal + (hasFreeDelivery ? 0 : config?.store?.taxaEntrega || 5) - summary.discount)}
            </span>
          </div>
        </div>

        {/* Cupom */}
        {!showCouponInput && !appliedCoupon ? (
          <button 
            onClick={() => setShowCouponInput(true)}
            className="w-full bg-white rounded-lg p-4 mt-4 flex items-center justify-between shadow-sm hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Percent className="text-orange-600" size={20} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Tem um cupom?</p>
                <p className="text-xs text-gray-500">Clique e insira o código</p>
              </div>
            </div>
            <span className="text-gray-400">›</span>
          </button>
        ) : (
          <div className="mt-4">
            <CouponInput subtotal={summary.subtotal} />
          </div>
        )}

        {appliedCoupon && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="text-green-600" size={16} />
              <span className="text-sm font-semibold text-green-700">
                Cupom "{appliedCoupon}" aplicado!
              </span>
            </div>
            <button 
              onClick={removeCoupon}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Remover
            </button>
          </div>
        )}

        {/* Botão de finalizar */}
        <button 
          onClick={() => {
            navigate('/checkout', { state: { step: 'info' } });
          }}
          disabled={items.length === 0}
          className={`w-full ${items.length > 0 ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-400'} text-white rounded-lg p-4 mt-4 font-bold text-lg disabled:opacity-50 transition-colors`}
        >
          {items.length > 0 ? 'Ir para Pagamento' : 'Adicione itens ao carrinho'}
        </button>
        
        {/* Aviso se estiver fechado, mas não bloqueia */}
        {!storeOpen && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ {config?.mensagens?.estabelecimentoFechado || 'Estabelecimento fechado'} - {openingMessage}
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Você pode finalizar o pedido, mas a entrega será feita quando reabrimos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

