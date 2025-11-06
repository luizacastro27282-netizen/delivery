import { create } from 'zustand';
import { Product } from '@/types/product';
import { api } from '@/lib/api';

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  selectedCategory: string;
  searchQuery: string;
  
  // Actions
  loadProducts: () => Promise<void>;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (category: string) => Product[];
  getCategories: () => string[];
  getFilteredProducts: () => Product[];
  addProduct: (product: Partial<Product>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  selectedCategory: 'all',
  searchQuery: '',

  loadProducts: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.get<{ products: Product[]; total: number }>('/products', {
        requiresAuth: false
      });
      
      set({
        products: response.products || [],
        loading: false
      });
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      // Fallback para JSON local se API falhar
      try {
        const localResponse = await fetch('/data/products.json');
        if (localResponse.ok) {
          const products: Product[] = await localResponse.json();
          set({
            products: products.filter(p => p.available),
            loading: false
          });
        } else {
          throw error;
        }
      } catch (fallbackError) {
        set({
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          loading: false
        });
      }
    }
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  getProductById: (id) => {
    return get().products.find(p => p.id === id);
  },

  getProductsByCategory: (category) => {
    const { products } = get();
    if (category === 'all') return products;
    return products.filter(p => p.category === category);
  },

  getCategories: () => {
    const { products } = get();
    const categories = new Set(products.map(p => p.category));
    return ['all', ...Array.from(categories)];
  },

  getFilteredProducts: () => {
    const { products, selectedCategory, searchQuery } = get();
    
    let filtered = products;
    
    // Filtrar por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    // Filtrar por busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  },

  addProduct: async (productData) => {
    try {
      const response = await api.post<{ product: Product }>('/admin/products', productData, {
        requiresAdmin: true
      });

      if (response?.product) {
        set((state) => ({
          products: [...state.products, response.product]
        }));
      }
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const response = await api.put<{ product: Product }>(`/admin/products/${id}`, productData, {
        requiresAdmin: true
      });

      if (response?.product) {
        set((state) => ({
          products: state.products.map(p => p.id === id ? response.product : p)
        }));
      }
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      await api.delete(`/admin/products/${id}`, {
        requiresAdmin: true
      });

      set((state) => ({
        products: state.products.filter(p => p.id !== id)
      }));
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }
  }
}));

