// src/components/search/FilterSidebar.tsx
'use client';

import React from 'react';
import { Platform } from '@/types/issues';

interface FilterSidebarProps {
  activePlatforms: Platform[];
  activeLanguages: string[];
  onTogglePlatform: (platform: Platform) => void;
  onToggleLanguage: (language: string) => void;
}

// These are our constants for the live search
const PLATFORMS: Platform[] = ['github', 'gitlab'];
const LANGUAGES: string[] = ['typescript', 'python', 'javascript', 'rust', 'go', 'java'];

export const FilterSidebar = ({
  activePlatforms,
  activeLanguages,
  onTogglePlatform,
  onToggleLanguage,
}: FilterSidebarProps): React.ReactElement => {

  // Helper to keep the JSX clean and DRY
  const renderToggleButton = (
    label: string, 
    isSelected: boolean, 
    onClick: () => void
  ): React.ReactElement => (
    <button
      key={label}
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all duration-200 border ${
        isSelected
          ? 'bg-blue-600/10 text-blue-400 border-blue-500/30'
          : 'text-zinc-400 border-transparent hover:bg-zinc-800 hover:text-zinc-200'
      }`}
    >
      <span className="capitalize">{label}</span>
      {isSelected && <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
    </button>
  );

  return (
    <aside className="w-full md:w-64 shrink-0 sticky top-6 self-start space-y-8">
      <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl backdrop-blur-sm">
        
        {/* Platform Section */}
        <section className="mb-8">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
            Source Platform
          </h3>
          <div className="flex flex-col space-y-1">
            {PLATFORMS.map((p: Platform): React.ReactElement => 
              renderToggleButton(p, activePlatforms.includes(p), () => onTogglePlatform(p))
            )}
          </div>
        </section>

        {/* Language Section */}
        <section>
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
            Language
          </h3>
          <div className="flex flex-col space-y-1">
            {LANGUAGES.map((l: string): React.ReactElement => 
              renderToggleButton(l, activeLanguages.includes(l), () => onToggleLanguage(l))
            )}
          </div>
        </section>

      </div>
      
      <div className="px-5 py-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          Showing <span className="text-blue-400">Good First Issues</span> and <span className="text-blue-400">Quick Wins</span>.
        </p>
      </div>
    </aside>
  );
};