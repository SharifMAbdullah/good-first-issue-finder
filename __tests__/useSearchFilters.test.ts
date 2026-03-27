// src/__tests__/useSearchFilters.test.ts
import { renderHook, act } from '@testing-library/react';
import { useSearchFilters } from '../hooks/useSearchFilters';
import { ProjectItem, Category } from '../types';

const mockData: ProjectItem[] = [
  { id: '1', title: 'React Dashboard', description: 'UI', category: 'Frontend', tags: ['React'] },
  { id: '2', title: 'Node API', description: 'Core', category: 'Backend', tags: ['Node'] },
];

describe('useSearchFilters', (): void => {
  it('should filter items by text query', (): void => {
    const { result } = renderHook((): any => useSearchFilters(mockData));
    
    act((): void => {
      result.current.setQuery('API');
    });

    const filtered: ProjectItem[] = result.current.filteredItems;
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toBe('Node API');
  });

  it('should toggle category filters correctly', (): void => {
    const { result } = renderHook((): any => useSearchFilters(mockData));
    
    act((): void => {
      result.current.toggleCategory('Frontend');
    });

    const filtered: ProjectItem[] = result.current.filteredItems;
    expect(filtered.length).toBe(1);
    expect(result.current.state.categories.includes('Frontend')).toBe(true);
  });
});