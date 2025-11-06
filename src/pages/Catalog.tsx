import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useProductStore } from '@/store/useProductStore';
import { usePromotionStore } from '@/store/usePromotionStore';
import { useLocationStore } from '@/store/useLocationStore';
import { useCart } from '@/hooks/useCart';
import { Product } from '@/types/product';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ProductCard } from '@/components/catalog/ProductCard';
import { CategoryFilter } from '@/components/catalog/CategoryFilter';
import { PromotionBanner } from '@/components/catalog/PromotionBanner';
import { FlashPromos } from '@/components/catalog/FlashPromos';
import { ProductModalFullscreen } from '@/components/product/ProductModalFullscreen';
import { LocationModal } from '@/components/location/LocationModal';
import { BannerHeader } from '@/components/layout/BannerHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { formatCurrency } from '@/lib/utils';

export const Catalog = () => {
  const {
    loading: productsLoading,
    selectedCategory,
    searchQuery,
    loadProducts,
    setSelectedCategory,
    setSearchQuery,
    getCategories,
    getFilteredProducts
  } = useProductStore();

  const { loadPromotions, getActivePromotions } = usePromotionStore();
  const { hasSelectedLocation, setLocation } = useLocationStore();
  const cart = useCart();
  const summary = cart?.summary || { savings: 0 };

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(!hasSelectedLocation);

  // Carrega dados iniciais
  useEffect(() => {
    loadProducts();
    loadPromotions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectLocation = (state: string, city: string) => {
    setLocation(state, city);
    setShowLocationModal(false);
  };

  // Proteção contra erros
  let categories: string[] = [];
  let filteredProducts: Product[] = [];
  let activePromotions: any[] = [];

  try {
    categories = getCategories ? getCategories() : [];
    filteredProducts = getFilteredProducts ? getFilteredProducts() : [];
    activePromotions = getActivePromotions ? getActivePromotions() : [];
  } catch (error) {
    console.error('Erro ao obter dados do catalog:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-40 md:pb-6">
      {/* Novo Banner Header */}
      <BannerHeader />
      
      {/* Promoções Relâmpago */}
      <div className="max-w-7xl mx-auto px-4">
        <FlashPromos onProductSelect={setSelectedProduct} />
      </div>
      
      {/* Busca */}
      <div className="bg-white shadow-sm mt-6">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Buscar pizzas, bebidas, combos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Economia Total */}
        {summary.savings > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-green-900 font-semibold">
                🎉 Você está economizando {formatCurrency(summary.savings)}!
              </p>
              <p className="text-sm text-green-700">
                Promoções automáticas aplicadas
              </p>
            </div>
            <Badge variant="success" className="text-lg px-4 py-2">
              -{formatCurrency(summary.savings)}
            </Badge>
          </motion.div>
        )}

        {/* Banner de Promoções */}
        <PromotionBanner promotions={activePromotions} />

        {/* Filtro de Categorias */}
        <div className="mb-6">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Grid de Produtos */}
        {productsLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={setSelectedProduct}
                index={index}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal de Localização */}
      <LocationModal
        isOpen={showLocationModal}
        onSelectLocation={handleSelectLocation}
      />

      {/* Modal de Produto com Selects */}
      {selectedProduct && (
        <ProductModalFullscreen
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

