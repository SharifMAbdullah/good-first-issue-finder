// src/components/search/ResultCard.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github, Gitlab, Clock } from 'lucide-react';
import { UnifiedIssue } from '@/types/issues';

interface ResultCardProps {
  issue: UnifiedIssue;
  onTagClick: (tag: string) => void;
}

export const ResultCard = ({ issue, onTagClick }: ResultCardProps): React.ReactElement => {
  // Helper function to format the ISO date string into a readable format
  const formatDate = (isoString: string): string => {
    const date: Date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  // Prevent the tag click from propagating to the parent <a> tag wrapper
  const handleTagClick = (e: React.MouseEvent<HTMLButtonElement>, tag: string): void => {
    e.preventDefault();
    e.stopPropagation();
    onTagClick(tag);
  };

  const isGithub: boolean = issue.platform === 'github';

  return (
    <motion.a
      href={issue.url}
      target="_blank"
      rel="noopener noreferrer"
      layout
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="block p-5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl group transition-all duration-200"
    >
      <div className="flex flex-col h-full justify-between">
        
        {/* Header: Platform Icon, Repo Name, and Date */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 text-zinc-400">
            {isGithub ? <Github size={16} /> : <Gitlab size={16} />}
            <span className="text-sm font-medium">{issue.repositoryName}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <Clock size={12} />
            <span>{formatDate(issue.createdAt)}</span>
          </div>
        </div>

        {/* Title and External Link Indicator */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <h4 className="text-lg font-medium text-zinc-100 group-hover:text-blue-400 transition-colors line-clamp-2">
            {issue.title}
          </h4>
          <ExternalLink 
            size={18} 
            className="text-zinc-600 group-hover:text-blue-400 flex-shrink-0 mt-1 transition-colors" 
          />
        </div>

        {/* Tags / Labels */}
        <div className="flex flex-wrap gap-2 mt-auto">
          {issue.labels.map((label: string, index: number): React.ReactElement => (
            <button
              key={`${issue.id}-label-${index}`}
              onClick={(e: React.MouseEvent<HTMLButtonElement>): void => handleTagClick(e, label)}
              className="text-xs font-medium px-2 py-1 rounded-md bg-zinc-950 text-zinc-400 border border-zinc-800 hover:border-blue-500/50 hover:text-blue-400 transition-colors cursor-pointer z-10"
            >
              {label}
            </button>
          ))}
          {issue.language && (
            <button
              onClick={(e: React.MouseEvent<HTMLButtonElement>): void => handleTagClick(e, issue.language as string)}
              className="text-xs font-medium px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:border-blue-500/50 transition-colors cursor-pointer z-10"
            >
              {issue.language}
            </button>
          )}
        </div>

      </div>
    </motion.a>
  );
};