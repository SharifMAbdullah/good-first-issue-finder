import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps): React.ReactElement => {
  return (
    <div className="relative w-full mb-6">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-5 h-5 text-zinc-500" />
      </div>
      <input
        type="text"
        className="block w-full p-4 pl-10 pr-10 text-sm text-gray-100 bg-zinc-900 border border-zinc-800 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-zinc-500 transition-colors"
        placeholder="Search issues by keyword..."
        aria-label="Search issues"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-300 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
