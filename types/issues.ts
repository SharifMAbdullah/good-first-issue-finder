// src/types/issues.ts

export type Platform = 'github' | 'gitlab';

// Our clean, unified interface
export interface UnifiedIssue {
  id: string;
  platform: Platform;
  title: string;
  author: string;
  url: string;
  repositoryName: string;
  labels: string[];
  createdAt: string;
  language: string | null;
}

export interface RawGithubIssue {
  id: number;
  html_url: string;
  title: string;
  author: string;
  created_at: string;
  repository_url: string;
  labels: Array<{ name: string }>;
}

export interface GitlabReferences {
  full: string;
}

export interface RawGitlabIssue {
  id: number;
  title: string;
  state: string;
  created_at: string;
  references: GitlabReferences;
  labels: string[];
  web_url: string;
  author: string;
}

export interface FetchIssuesParams {
  platforms: Platform[];
  languages: string[];
  page: number;
}

export interface PaginatedResponse {
  issues: UnifiedIssue[];
  nextPage: number | null;
  totalCount: number;
}