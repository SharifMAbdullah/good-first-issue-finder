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

const fetchGithubIssues = async (languages: string[], page: number): Promise<UnifiedIssue[]> => {
  const languageQuery: string = languages.length > 0 
    ? languages.map((lang: string): string => `language:${lang}`).join(' ') 
    : '';
  
  const searchQuery: string = `label:"good first issue" state:open ${languageQuery}`.trim();
  const encodedQuery: string = encodeURIComponent(searchQuery);
  const url: string = `https://api.github.com/search/issues?q=${encodedQuery}&per_page=20&page=${page}`;

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
  instance: GitlabInstance
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

    const params: URLSearchParams = new URLSearchParams({
      scope: 'all',
      state: 'opened',
      order_by: 'created_at',
      sort: 'desc',
      per_page: '4',
      page: page.toString(),
    });

    if (instance.name == 'GitLab') {
      params.set('labels', 'quick win')
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
  page: number
): Promise<UnifiedIssue[]> => {
  const fetchPromises: Array<Promise<UnifiedIssue[]>> = KNOWN_GITLAB_INSTANCES.map(
    (instance: GitlabInstance): Promise<UnifiedIssue[]> => 
      fetchSingleGitlabIssue(languages, page, instance)
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

    const params: FetchIssuesParams = {
      platforms: (platformsParam.length > 0 ? platformsParam : ['github']) as Platform[],
      languages: languagesParam,
      page: isNaN(pageParam) || pageParam < 1 ? 1 : pageParam,
    };

    const fetchPromises: Promise<UnifiedIssue[]>[] = [];

    // Push fetch promises based on active URL state
    if (params.platforms.includes('github')) {
      fetchPromises.push(fetchGithubIssues(params.languages, params.page));
    }
    
    if (params.platforms.includes('gitlab')) {
      fetchPromises.push(fetchAllGitlabIssues(params.languages, params.page));
    }

    // Execute concurrently. Because our individual fetchers catch their own errors 
    // and return [], Promise.all is safe to use here without fear of a single rejection 
    // destroying the entire request.
    const results: UnifiedIssue[][] = await Promise.all(fetchPromises);
    
    const combinedIssues: UnifiedIssue[] = results.flat();

    // Sort combined results by newest first to interleave GitHub and GitLab issues naturally
    combinedIssues.sort((a: UnifiedIssue, b: UnifiedIssue): number => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

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