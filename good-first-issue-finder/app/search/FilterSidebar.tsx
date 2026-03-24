// src/components/search/FilterSidebar.tsx
import React from 'react';
import { Platform } from '@/types/issues';

interface FilterSidebarProps {
  activePlatforms: Platform[];
  activeLanguages: string[];
  onTogglePlatform: (platform: Platform) => void;
  onToggleLanguage: (language: string) => void;
}

const AVAILABLE_PLATFORMS: Platform[] = ['github', 'gitlab'];
const AVAILABLE_LANGUAGES: string[] = ['typescript', 'python', 'javascript', 'rust', 'go', 'java', 'c++'];

export const FilterSidebar = ({
  activePlatforms,
  activeLanguages,
  onTogglePlatform,
  onToggleLanguage,
}: FilterSidebarProps): React.ReactElement => {
  
  const renderFilterButton = (
    label: string, 
    isSelected: boolean, 
    onClick: () => void
  ): React.ReactElement => (
    <button
      key={label}
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all duration-200 ${
        isSelected
          ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30'
          : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-transparent'
      }`}
    >
      <span className="capitalize">{label}</span>
      {isSelected && <span className="w-2 h-2 rounded-full bg-blue-500" />}
    </button>
  );

  return (
    <aside className="w-full md:w-64 flex-shrink-0 sticky top-6 self-start space-y-6">
      <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
        
        <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-4">Platforms</h3>
        <div className="flex flex-col space-y-2 mb-8">
          {AVAILABLE_PLATFORMS.map((platform: Platform): React.ReactElement => 
            renderFilterButton(platform, activePlatforms.includes(platform), (): void => onTogglePlatform(platform))
          )}
        </div>

        <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-4">Languages</h3>
        <div className="flex flex-col space-y-2">
          {AVAILABLE_LANGUAGES.map((lang: string): React.ReactElement => 
            renderFilterButton(lang, activeLanguages.includes(lang), (): void => onToggleLanguage(lang))
          )}
        </div>

      </div>
    </aside>
  );
};