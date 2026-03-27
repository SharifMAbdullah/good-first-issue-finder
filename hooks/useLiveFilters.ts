// src/hooks/useLiveFilters.ts
import { useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Platform } from '@/types/issues';

export interface UseLiveFiltersReturn {
  activePlatforms: Platform[];
  activeLanguages: string[];
  currentPage: number;
  togglePlatform: (platform: Platform) => void;
  toggleLanguage: (language: string) => void;
  setPage: (page: number) => void;
}

export const useLiveFilters = (): UseLiveFiltersReturn => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname: string = usePathname();

  // Parse arrays safely from URL
  const activePlatforms: Platform[] = useMemo((): Platform[] => {
    const platforms: string | null = searchParams.get('platforms');
    return platforms ? (platforms.split(',') as Platform[]) : ['github'];
  }, [searchParams]);

  const activeLanguages: string[] = useMemo((): string[] => {
    const languages: string | null = searchParams.get('languages');
    return languages ? languages.split(',') : [];
  }, [searchParams]);

  const currentPage: number = parseInt(searchParams.get('page') || '1', 10);

  // Helper to update URL without refreshing the page
  const updateUrl = useCallback((key: string, values: string[] | string): void => {
    const params: URLSearchParams = new URLSearchParams(searchParams.toString());
    
    if (Array.isArray(values)) {
      if (values.length > 0) {
        params.set(key, values.join(','));
      } else {
        params.delete(key);
      }
    } else {
      params.set(key, values);
    }
    
    // Reset to page 1 whenever filters change
    if (key !== 'page') {
      params.set('page', '1');
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  const togglePlatform = useCallback((platform: Platform): void => {
    const isSelected: boolean = activePlatforms.includes(platform);
    const newPlatforms: Platform[] = isSelected
      ? activePlatforms.filter((p: Platform): boolean => p !== platform)
      : [...activePlatforms, platform];
    
    updateUrl('platforms', newPlatforms);
  }, [activePlatforms, updateUrl]);

  const toggleLanguage = useCallback((language: string): void => {
    const isSelected: boolean = activeLanguages.includes(language);
    const newLanguages: string[] = isSelected
      ? activeLanguages.filter((l: string): boolean => l !== language)
      : [...activeLanguages, language];
    
    updateUrl('languages', newLanguages);
  }, [activeLanguages, updateUrl]);

  const setPage = useCallback((page: number): void => {
    updateUrl('page', page.toString());
  }, [updateUrl]);

  return { activePlatforms, activeLanguages, currentPage, togglePlatform, toggleLanguage, setPage };
};