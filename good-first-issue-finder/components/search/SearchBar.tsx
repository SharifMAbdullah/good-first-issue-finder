import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps): React.ReactElement => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onChange(e.target.value);
  };

  return (
    <div className="relative w-full mb-6">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-5 h-5 text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full p-4 pl-10 text-sm text-gray-100 bg-zinc-900 border border-zinc-800 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 transition-colors"
        placeholder="Search projects, stacks, or keywords..."
        value={value}
        onChange={handleChange}
      />
    </div>
  );
};