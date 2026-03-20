import React from 'react';
import { motion } from 'framer-motion';
import { ProjectItem } from '@/types';

interface ResultCardProps {
  item: ProjectItem;
}

export const ResultCard = ({ item }: ResultCardProps): React.ReactElement => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="p-5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl flex flex-col justify-between group transition-colors"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xl font-medium text-gray-100 group-hover:text-blue-400 transition-colors">
            {item.title}
          </h4>
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-zinc-800 text-gray-300 border border-zinc-700">
            {item.category}
          </span>
        </div>
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {item.description}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 mt-auto">
        {item.tags.map((tag: string, index: number): React.ReactElement => (
          <span 
            key={`${item.id}-${index}`} 
            className="text-xs font-medium px-2 py-1 rounded-md bg-zinc-950 text-gray-500 border border-zinc-800"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
};