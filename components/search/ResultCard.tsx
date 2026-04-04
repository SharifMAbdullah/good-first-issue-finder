'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Clock } from 'lucide-react';
import { UnifiedIssue } from '@/types/issues';
import { BookmarkButton } from '../ui/bookmarkbutton';

interface ResultCardProps {
  issue: UnifiedIssue;
  onTagClick: (tag: string) => void;
}

// Simple Icons SVGs for GitHub and GitLab
const GithubIcon = ({ size = 16 }: { size?: number }): React.ReactElement => (
  <svg role="img" viewBox="0 0 24 24" width={size} height={size} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

const GitlabIcon = ({ size = 16 }: { size?: number }): React.ReactElement => (
  <svg role="img" viewBox="0 0 24 24" width={size} height={size} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="m23.705 13.521-1.171-3.606a.71.71 0 0 0-.23-.332.712.712 0 0 0-.4-.124h-.012a.712.712 0 0 0-.393.119.71.71 0 0 0-.24.322l-1.42 4.373H4.161l-1.42-4.373a.711.711 0 0 0-.24-.322.713.713 0 0 0-.393-.119h-.012a.713.713 0 0 0-.4.124.711.711 0 0 0-.23.332L.295 13.521a1.002 1.002 0 0 0 .363 1.117l11.025 8.012a.541.541 0 0 0 .634 0l11.025-8.012a1.002 1.002 0 0 0 .363-1.117zM12 2.378l2.002 6.162h-4.004L12 2.378z"/>
  </svg>
);

export const ResultCard = ({ issue, onTagClick }: ResultCardProps): React.ReactElement => {
  const formatDate = (isoString: string): string => {
    const date: Date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

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
      className="relative block p-5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl group transition-all duration-200"
    >
      <div className="flex flex-col h-full justify-between">
        {/* Header: Platform, Repo, Date AND Bookmark */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 text-zinc-400">
            {isGithub ? <GithubIcon size={16} /> : <GitlabIcon size={16} />}
            <span className="text-sm font-medium">{issue.repositoryName}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-zinc-500">
              <Clock size={12} />
              <span>{formatDate(issue.createdAt)}</span>
            </div>
            {/* The Bookmark Button - Integrated with stopping propagation */}
            <div className="z-20">
               <BookmarkButton issue={issue} />
            </div>
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
              className="relative text-xs font-medium px-2 py-1 rounded-md bg-zinc-950 text-zinc-400 border border-zinc-800 hover:border-blue-500/50 hover:text-blue-400 transition-colors cursor-pointer z-10"
            >
              {label}
            </button>
          ))}
          {issue.language && (
            <button
              onClick={(e: React.MouseEvent<HTMLButtonElement>): void => handleTagClick(e, issue.language as string)}
              className="relative text-xs font-medium px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:border-blue-500/50 transition-colors cursor-pointer z-10"
            >
              {issue.language}
            </button>
          )}
        </div>
      </div>
    </motion.a>
  );
};