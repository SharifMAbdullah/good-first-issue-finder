// src/hooks/useLiveIssues.ts
import { useState, useEffect, useCallback } from 'react';
import { UnifiedIssue, Platform } from '@/types/issues';

export interface LiveIssuesState {
  issues: UnifiedIssue[];
  isLoading: boolean;
  error: string | null;
}

export const useLiveIssues = (platforms: Platform[], languages: string[], page: number): LiveIssuesState => {
  const [state, setState] = useState<LiveIssuesState>({
    issues: [],
    isLoading: true,
    error: null,
  });

  const fetchIssues = useCallback(async (): Promise<void> => {
    setState((prev: LiveIssuesState): LiveIssuesState => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const params: URLSearchParams = new URLSearchParams();
      if (platforms.length > 0) params.append('platforms', platforms.join(','));
      if (languages.length > 0) params.append('languages', languages.join(','));
      params.append('page', page.toString());

      const response: Response = await fetch(`/api/issues?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }
      
      // Expected response shape from our API route
      const data: { issues: UnifiedIssue[] } = await response.json();

      setState({ issues: data.issues, isLoading: false, error: null });
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : 'An unknown network error occurred';
      setState({ issues: [], isLoading: false, error: errorMessage });
    }
  }, [platforms, languages, page]);

  useEffect((): void => {
    fetchIssues();
  }, [fetchIssues]);

  return state;
};