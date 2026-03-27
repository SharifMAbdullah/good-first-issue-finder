// src/types/index.ts

export type Category = 'Frontend' | 'Backend' | 'Fullstack' | 'DevOps';

export type ProjectItem = {
  id: string;
  title: string;
  description: string;
  category: Category;
  tags: string[];
};

export type FilterState = {
  query: string;
  categories: Category[];
};

export type UseSearchFiltersReturn = {
  state: FilterState;
  filteredItems: ProjectItem[];
  setQuery: (query: string) => void;
  toggleCategory: (category: Category) => void;
};