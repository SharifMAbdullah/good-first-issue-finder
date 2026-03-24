// src/app/search/page.tsx
'use client';

import React, { Suspense } from 'react';
import { FilterSidebar } from '@/components/search/FilterSidebar';
import { useLiveFilters } from '@/hooks/useLiveFilters';
import { useLiveIssues } from '@/hooks/useLiveIssues';
import { UnifiedIssue } from '@/types/issues';
// Assuming ResultCard is imported here once adapted to UnifiedIssue
import { ResultCard } from '@/components/search/ResultCard';

const SearchContent = (): React.ReactElement => {
  // 1. Read state from URL
  const { 
    activePlatforms, 
    activeLanguages, 
    currentPage, 
    togglePlatform, 
    toggleLanguage,
    setPage
  } = useLiveFilters();

  // 2. Fetch data based on URL state
  const { issues, isLoading, error } = useLiveIssues(activePlatforms, activeLanguages, currentPage);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <FilterSidebar
        activePlatforms={activePlatforms}
        activeLanguages={activeLanguages}
        onTogglePlatform={togglePlatform}
        onToggleLanguage={toggleLanguage}
      />

      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Status Indicators */}
        <div className="mb-6 h-6 flex items-center">
          {isLoading && <span className="text-sm text-blue-400 animate-pulse">Synchronizing with upstreams...</span>}
          {error && <span className="text-sm text-red-500">Failed to fetch: {error}</span>}
          {!isLoading && !error && issues.length > 0 && (
            <span className="text-sm text-zinc-500">Showing {issues.length} open issues</span>
          )}
        </div>

        {/* Results Grid */}
        <div className="relative min-h-100">
          {!isLoading && !error && issues.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-zinc-800 rounded-xl">
              <p className="text-zinc-500">No `Good First Issues` found for the selected criteria.</p>
              <button 
                onClick={(): void => { togglePlatform('github'); toggleLanguage('typescript'); }}
                className="mt-4 text-blue-400 hover:underline text-sm"
              >
                Reset to defaults
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {issues.map((issue: UnifiedIssue): React.ReactElement => (
                <ResultCard 
                  key={issue.id} 
                  issue={issue} 
                  // Wiring the tag click directly into our URL router state
                  onTagClick={toggleLanguage} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Basic Pagination Controls */}
        {!isLoading && !error && issues.length > 0 && (
          <div className="mt-8 flex justify-center gap-4">
            <button
              disabled={currentPage === 1}
              onClick={(): void => setPage(currentPage - 1)}
              className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={(): void => setPage(currentPage + 1)}
              className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-300"
            >
              Next Page
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

const SearchPage = (): React.ReactElement => {
  return (
    <div className="min-h-screen bg-black text-zinc-200 p-6 md:p-12 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Component injected directly into layout */}
        <header className="mb-10 pb-6 border-b border-zinc-800/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <span className="text-blue-500 font-bold text-lg">O</span>
            </div>
            <h1 className="text-3xl font-semibold text-white tracking-tight">OpenSource Start</h1>
          </div>
          <p className="text-zinc-500 text-sm max-w-xl">
            A unified dashboard for discovering "Good First Issues" and "Quick Wins" across GitHub and GitLab. Select your stack and start contributing.
          </p>
        </header>

        {/* Suspense boundary required by Next.js when using useSearchParams in Client Components */}
        <Suspense fallback={<div className="text-zinc-500 animate-pulse">Initializing router...</div>}>
          <SearchContent />
        </Suspense>

      </div>
    </div>
  );
};

export default SearchPage;