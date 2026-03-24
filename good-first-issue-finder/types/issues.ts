// src/types/issues.ts

export type Platform = 'github' | 'gitlab';

// Our clean, unified interface
export interface UnifiedIssue {
  id: string;
  platform: Platform;
  title: string;
  url: string;
  repositoryName: string;
  labels: string[];
  createdAt: string;
  language: string | null;
}

// Minimal representations of the raw 3rd-party payloads we care about
export interface RawGithubIssue {
  id: number;
  html_url: string;
  title: string;
  created_at: string;
  repository_url: string;
  labels: Array<{ name: string }>;
}

export interface RawGitlabIssue {
  id: number;
  web_url: string;
  title: string;
  created_at: string;
  references: { full: string };
  labels: string[];
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