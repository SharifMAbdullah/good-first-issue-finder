// src/lib/adapters/issueAdapters.ts
import { RawGithubIssue, RawGitlabIssue, UnifiedIssue } from '@/types/issues';

export const normalizeGithubIssue = (raw: RawGithubIssue): UnifiedIssue => {
  // Extract 'owner/repo' from 'https://api.github.com/repos/owner/repo'
  const repoName: string = raw.repository_url.replace('https://api.github.com/repos/', '');
  const mappedLabels: string[] = raw.labels.map((label: { name: string }): string => label.name);

  return {
    id: `gh-${raw.id}`,
    platform: 'github',
    title: raw.title,
    author: raw.author,
    url: raw.html_url,
    repositoryName: repoName,
    labels: mappedLabels,
    createdAt: raw.created_at,
    language: null, // Requires an additional API call to the repo endpoint to be perfectly accurate, omitted for performance
  };
};

export const normalizeGitlabIssue = (raw: RawGitlabIssue, sourceName: string): UnifiedIssue => {
  // Extract repository path before the issue number hash
  const referenceParts: string[] = raw.references.full.split('#');
  const repoPath: string = referenceParts[0] || 'Unknown Repository';

  const repoName: string = `${sourceName}: ${repoPath.split('/').pop() || repoPath}`

  return {
    id: `gl-${raw.id}`,
    platform: 'gitlab',
    title: raw.title,
    url: raw.web_url,
    repositoryName: repoName,
    labels: raw.labels,
    createdAt: raw.created_at,
    author: raw.author,
    language: null,
  };
};