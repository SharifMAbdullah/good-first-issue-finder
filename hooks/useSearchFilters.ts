// src/hooks/useSearchFilters.ts
import { useState, useMemo, useCallback } from 'react';
import { ProjectItem, FilterState, Category, UseSearchFiltersReturn } from '../types';

export const useSearchFilters = (initialItems: ProjectItem[]): UseSearchFiltersReturn => {
  const [state, setState] = useState<FilterState>({
    query: '',
    categories: [],
  });

  const setQuery = useCallback((newQuery: string): void => {
    setState((prev: FilterState): FilterState => ({ ...prev, query: newQuery }));
  }, []);

  const toggleCategory = useCallback((category: Category): void => {
    setState((prev: FilterState): FilterState => {
      const isSelected: boolean = prev.categories.includes(category);
      const newCategories: Category[] = isSelected
        ? prev.categories.filter((c: Category): boolean => c !== category)
        : [...prev.categories, category];

      return { ...prev, categories: newCategories };
    });
  }, []);

  const filteredItems: ProjectItem[] = useMemo((): ProjectItem[] => {
    return initialItems.filter((item: ProjectItem): boolean => {
      const matchesQuery: boolean = item.title.toLowerCase().includes(state.query.toLowerCase()) || 
                                    item.description.toLowerCase().includes(state.query.toLowerCase());
      
      const matchesCategory: boolean = state.categories.length === 0 || state.categories.includes(item.category);
      
      return matchesQuery && matchesCategory;
    });
  }, [initialItems, state]);

  return { state, filteredItems, setQuery, toggleCategory };
};