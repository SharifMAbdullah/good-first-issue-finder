import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const FilterChip = ({ label, isActive, onClick }: FilterChipProps): React.ReactElement => {
  // Enforcing strict type for the motion variants
  const variants: any = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 }
  };

  return (
    <motion.button
      layout
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
        isActive
          ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
      }`}
    >
      {label}
      {isActive && <X size={12} className="ml-1 opacity-70" />}
    </motion.button>
  );
};