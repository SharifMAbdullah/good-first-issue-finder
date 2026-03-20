import React from 'react';
import { Category } from '@/types';

interface FilterSidebarProps {
  availableCategories: Category[];
  selectedCategories: Category[];
  onToggleCategory: (category: Category) => void;
}

export const FilterSidebar = ({ 
  availableCategories, 
  selectedCategories, 
  onToggleCategory 
}: FilterSidebarProps): React.ReactElement => {
  return (
    <aside className="w-full md:w-64 flex-shrink-0 sticky top-6 self-start space-y-6">
      <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
        <div className="flex flex-col space-y-2">
          {availableCategories.map((category: Category): React.ReactElement => {
            const isSelected: boolean = selectedCategories.includes(category);
            return (
              <button
                key={category}
                onClick={(): void => onToggleCategory(category)}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                  isSelected 
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30' 
                    : 'text-gray-400 hover:bg-zinc-800 hover:text-gray-200 border border-transparent'
                }`}
              >
                <span>{category}</span>
                {isSelected && <span className="w-2 h-2 rounded-full bg-blue-500" />}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};