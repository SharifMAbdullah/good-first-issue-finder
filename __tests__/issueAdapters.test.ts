// src/__tests__/issueAdapters.test.ts
import { normalizeGithubIssue, normalizeGitlabIssue } from '../lib/adapters/issueAdapters';
import { RawGithubIssue, RawGitlabIssue, UnifiedIssue } from '../types/issues';

describe('Issue Adapters', (): void => {
  it('should normalize a GitHub issue correctly', (): void => {
    const mockGithub: RawGithubIssue = {
      id: 12345,
      html_url: 'https://github.com/facebook/react/issues/1',
      title: 'Fix documentation typo',
      created_at: '2026-03-20T10:00:00Z',
      repository_url: 'https://api.github.com/repos/facebook/react',
      labels: [{ name: 'good first issue' }, { name: 'docs' }]
    };

    const result: UnifiedIssue = normalizeGithubIssue(mockGithub);

    expect(result.id).toBe('gh-12345');
    expect(result.platform).toBe('github');
    expect(result.repositoryName).toBe('facebook/react');
    expect(result.labels).toContain('good first issue');
  });

  it('should normalize a GitLab issue correctly', (): void => {
    const mockGitlab: RawGitlabIssue = {
      id: 67890,
      web_url: 'https://gitlab.com/gitlab-org/gitlab/-/issues/1',
      title: 'Update CI runner',
      created_at: '2026-03-21T10:00:00Z',
      references: { full: 'gitlab-org/gitlab#1' },
      labels: ['quick win', 'devops']
    };

    const result: UnifiedIssue = normalizeGitlabIssue(mockGitlab);

    expect(result.id).toBe('gl-67890');
    expect(result.platform).toBe('gitlab');
    expect(result.repositoryName).toBe('gitlab-org/gitlab');
    expect(result.labels).toContain('quick win');
  });
});