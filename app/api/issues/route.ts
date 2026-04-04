// src/app/api/issues/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  Platform, 
  FetchIssuesParams, 
  PaginatedResponse, 
  RawGithubIssue, 
  RawGitlabIssue, 
  UnifiedIssue 
} from '@/types/issues';
import { KNOWN_GITLAB_INSTANCES, GitlabInstance } from '@/lib/constants/gitLabInstances';
import { normalizeGithubIssue, normalizeGitlabIssue } from '@/lib/adapters/issueAdapters';

const parseArrayParam = (param: string | null): string[] => {
  if (!param) return [];
  return param.split(',').map((val: string): string => val.trim().toLowerCase());
};

const getGithubSortParams = (sortBy: string): string => {
  switch (sortBy) {
    case 'oldest':   return '&sort=created&order=asc';
    case 'updated':  return '&sort=updated&order=desc';
    case 'comments': return '&sort=comments&order=desc';
    default:         return '&sort=created&order=desc';
  }
};

const getGitlabSortParams = (sortBy: string): { order_by: string; sort: string } => {
  switch (sortBy) {
    case 'oldest':   return { order_by: 'created_at', sort: 'asc' };
    case 'updated':  return { order_by: 'updated_at', sort: 'desc' };
    default:         return { order_by: 'created_at', sort: 'desc' };
  }
};

const enrichGithubIssuesWithRepoData = async (
  issues: UnifiedIssue[],
  includeStarsForks: boolean = false
): Promise<UnifiedIssue[]> => {
  const uniqueRepos = [...new Set(issues.map(i => i.repositoryName))];

  const repoDataMap = new Map<string, { language: string | null; stars: number; forks: number }>();
  await Promise.all(
    uniqueRepos.map(async (repoName) => {
      try {
        const res = await fetch(`https://api.github.com/repos/${repoName}`, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
            'User-Agent': 'OpenSource-Start-Tracker',
          },
          next: { revalidate: 300 },
        });
        if (res.ok) {
          const data: { language?: string | null; stargazers_count?: number; forks_count?: number } = await res.json();
          repoDataMap.set(repoName, {
            language: data.language ?? null,
            stars: data.stargazers_count ?? 0,
            forks: data.forks_count ?? 0,
          });
        }
      } catch { /* silently skip */ }
    })
  );

  return issues.map(issue => {
    const repoData = repoDataMap.get(issue.repositoryName);
    return {
      ...issue,
      language: repoData?.language ?? null,
      ...(includeStarsForks ? {
        repoStars: repoData?.stars ?? null,
        repoForks: repoData?.forks ?? null,
      } : {}),
    };
  });
};

const sortIssues = (issues: UnifiedIssue[], sortBy: string): void => {
  issues.sort((a, b) => {
    switch (sortBy) {
      case 'oldest':   return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'updated':  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'comments': return b.commentCount - a.commentCount;
      case 'stars':    return (b.repoStars ?? 0) - (a.repoStars ?? 0);
      case 'forks':    return (b.repoForks ?? 0) - (a.repoForks ?? 0);
      default:         return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
};

const fetchGithubIssues = async (languages: string[], page: number, query: string = '', sortBy: string = 'newest'): Promise<UnifiedIssue[]> => {
  const languageQuery: string = languages.length > 0
    ? languages.map((lang: string): string => `language:${lang}`).join(' ')
    : '';

  const searchQuery: string = `label:"good first issue" state:open ${languageQuery} ${query}`.trim();
  const encodedQuery: string = encodeURIComponent(searchQuery);
  const sortParams: string = getGithubSortParams(sortBy);
  const url: string = `https://api.github.com/search/issues?q=${encodedQuery}&per_page=20&page=${page}${sortParams}`;

  try {
    const response: Response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'User-Agent': 'OpenSource-Start-Tracker'
      },
      next: { revalidate: 60 } 
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);

    const data: { items: RawGithubIssue[] } = await response.json();
    return data.items.map((raw: RawGithubIssue): UnifiedIssue => normalizeGithubIssue(raw));
  } catch (error: unknown) {
    console.error("Error fetching Github Issues: ", error);
    return [];
  }
};

const fetchSingleGitlabIssue = async (
  languages: string[],
  page: number,
  instance: GitlabInstance,
  query: string = '',
  sortBy: string = 'newest'
): Promise<UnifiedIssue[]> => {
  const startTime: number = performance.now();
  const controller: AbortController = new AbortController();
  // Set a strict 3.5-second timeout per instance to prevent the 10s hang
  const timeoutId: ReturnType<typeof setTimeout> = setTimeout((): void => {
    controller.abort();
  }, 3500);

  try {
    let apiUrl: string = `${instance.baseUrl}/api/v4/issues`;
    if (instance.path) {
      const encodedPath = encodeURIComponent(instance.path)
      apiUrl = `${instance.baseUrl}/api/v4/groups/${encodedPath}/issues`
    }

    const glSort = getGitlabSortParams(sortBy);
    const params: URLSearchParams = new URLSearchParams({
      scope: 'all',
      state: 'opened',
      order_by: glSort.order_by,
      sort: glSort.sort,
      per_page: '4',
      page: page.toString(),
    });

    if (instance.name == 'GitLab') {
      params.set('labels', 'quick win')
    }

    if (query) {
      params.set('search', query);
    }

    const url: string = `${apiUrl}?${params.toString()}`;

    const headers: HeadersInit = {
      'Accept': 'application/json',
      'User-Agent': 'OpenSource-Start-Tracker',
      'Authorization': `PRIVATE-TOKEN: ${process.env.GITLAB_TOKEN}`,
    };

    const response: Response = await fetch(url, {
      headers,
      next: { revalidate: 60 },
      signal: controller.signal // Attaches the abort timeout
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`GitLab API rejected request with status: ${response.status}`);
    }

    const data: RawGitlabIssue[] = await response.json();
    const gitlabIssues: RawGitlabIssue[] = data as RawGitlabIssue[];
    
    const endTime: number = performance.now();
    console.log(`[${instance.name}] Fetched successfully in ${Math.round(endTime - startTime)}ms`);

    return gitlabIssues.map((issue: RawGitlabIssue): UnifiedIssue => normalizeGitlabIssue(issue, instance.name));
    
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    
    // Check if the error was caused by our AbortController timeout
    if (error instanceof Error && error.name === 'AbortError') {
       console.error(`[${instance.name}] GitLab fetch timed out after 3.5s to prevent hanging.`);
       return [];
    }

    const msg: string = error instanceof Error ? error.message : String(error);
    console.error(`[${instance.name}] GitLab fetch failed:`, msg);
    return [];
  }
};

const fetchAllGitlabIssues = async (
  languages: string[],
  page: number,
  query: string = '',
  sortBy: string = 'newest'
): Promise<UnifiedIssue[]> => {
  const fetchPromises: Array<Promise<UnifiedIssue[]>> = KNOWN_GITLAB_INSTANCES.map(
    (instance: GitlabInstance): Promise<UnifiedIssue[]> =>
      fetchSingleGitlabIssue(languages, page, instance, query, sortBy)
  );
  
  const results: Array<Array<UnifiedIssue>> = await Promise.all(fetchPromises);
  const flatResults: Array<UnifiedIssue> = results.flat();
  
  return flatResults;
};

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    
    const platformsParam: string[] = parseArrayParam(searchParams.get('platforms'));
    const languagesParam: string[] = parseArrayParam(searchParams.get('languages'));
    const pageParam: number = parseInt(searchParams.get('page') || '1', 10);
    const queryParam: string = searchParams.get('q')?.trim() || '';
    const sortParam: string = searchParams.get('sort') || 'newest';

    const params: FetchIssuesParams = {
      platforms: (platformsParam.length > 0 ? platformsParam : ['github']) as Platform[],
      languages: languagesParam,
      page: isNaN(pageParam) || pageParam < 1 ? 1 : pageParam,
    };

    const fetchPromises: Promise<UnifiedIssue[]>[] = [];

    // Push fetch promises based on active URL state
    if (params.platforms.includes('github')) {
      fetchPromises.push(fetchGithubIssues(params.languages, params.page, queryParam, sortParam));
    }

    if (params.platforms.includes('gitlab')) {
      fetchPromises.push(fetchAllGitlabIssues(params.languages, params.page, queryParam, sortParam));
    }

    // Execute concurrently. Because our individual fetchers catch their own errors 
    // and return [], Promise.all is safe to use here without fear of a single rejection 
    // destroying the entire request.
    const results: UnifiedIssue[][] = await Promise.all(fetchPromises);

    let combinedIssues: UnifiedIssue[] = results.flat();

    // Always enrich GitHub issues with repo language; include stars/forks only when sorting by those fields
    const githubIssues = combinedIssues.filter(i => i.platform === 'github');
    if (githubIssues.length > 0) {
      const otherIssues = combinedIssues.filter(i => i.platform !== 'github');
      const includeStarsForks = sortParam === 'stars' || sortParam === 'forks';
      const enriched = await enrichGithubIssuesWithRepoData(githubIssues, includeStarsForks);
      combinedIssues = [...enriched, ...otherIssues];
    }

    sortIssues(combinedIssues, sortParam);

    const responsePayload: PaginatedResponse = {
      issues: combinedIssues,
      nextPage: combinedIssues.length > 0 ? params.page + 1 : null,
      totalCount: combinedIssues.length, 
    };

    return NextResponse.json(responsePayload);

  } catch (error: unknown) {
    const errorMessage: string = error instanceof Error ? error.message : 'Unknown routing error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}