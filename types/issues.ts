// src/types/issues.ts

export type Platform = "github" | "gitlab";

export type SortOption = "newest" | "oldest" | "comments" | "stars" | "forks";

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
  updatedAt: string;
  commentCount: number;
  repoStars: number | null;
  repoForks: number | null;
  language: string | null;
}

export interface RawGithubIssue {
  id: number;
  html_url: string;
  title: string;
  author: string;
  created_at: string;
  updated_at: string;
  comments: number;
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
  updated_at: string;
  user_notes_count: number;
  references: GitlabReferences;
  labels: string[];
  web_url: string;
  author: string;
  upvotes: number;
}

export interface FetchIssuesParams {
  platforms: Platform[];
  languages: string[];
  page: number;
  query: string;
  sort: string;
}

export interface PaginatedResponse {
  issues: UnifiedIssue[];
  nextPage: number | null;
  totalCount: number;
}
