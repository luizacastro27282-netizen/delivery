import { motion } from 'framer-motion';
import { Pizza, Wine, IceCream, Package, Grid } from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const categoryIcons: Record<string, any> = {
  all: Grid,
  pizzas: Pizza,
  bebidas: Wine,
  sobremesas: IceCream,
  combos: Package
};

const categoryLabels: Record<string, string> = {
  all: 'Todos',
  pizzas: 'Pizzas',
  bebidas: 'Bebidas',
  sobremesas: 'Sobremesas',
  combos: 'Combos'
};

export const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => {
        const Icon = categoryIcons[category] || Grid;
        const label = categoryLabels[category] || category;
        const isSelected = selectedCategory === category;

        return (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectCategory(category)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap
              transition-all font-medium text-sm
              ${isSelected
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
              }
            `}
          >
            <Icon size={18} />
            {label}
          </motion.button>
        );
      })}
    </div>
  );
};

