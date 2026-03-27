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
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
      },
      next: { revalidate: 60 } 
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);

    const data: { items: RawGithubIssue[] } = await response.json();
    return data.items.map((raw: RawGithubIssue): UnifiedIssue => normalizeGithubIssue(raw));
  } catch (error: unknown) {
    console.error(`GitHub fetch failed:`, error);
    return []; // Graceful degradation: return empty array instead of crashing
  }
};

const fetchGitlabIssues = async (languages: string[], page: number): Promise<UnifiedIssue[]> => {
  // GitLab relies strictly on labels rather than a parsed language AST.
  // We combine a generic beginner label with the requested languages.
  // const labels: string[] = ['quick win', ...languages];
  // const encodedLabels: string = encodeURIComponent(labels.join(','));
  
  // // GitLab v4 API for global open issues
  // const url: string = `https://gitlab.com/api/v4/issues?state=opened&labels=${encodedLabels}&per_page=20&page=${page}`;

  try {
  //   const response: Response = await fetch(url, {
  //     headers: {
  //       'Accept': 'application/json',
  //       // 'PRIVATE-TOKEN': process.env.GITLAB_TOKEN
  //     },
  //     next: { revalidate: 60 }
  //   });

  //   if (!response.ok) throw new Error(`Status ${response.status}`);

  //   // GitLab returns an array directly, not an object with an 'items' property
  //   const data: RawGitlabIssue[] = await response.json();
  //   return data.map((raw: RawGitlabIssue): UnifiedIssue => normalizeGitlabIssue(raw));
  return []
  } catch (error: unknown) {
    console.error(`GitLab fetch failed:`, error);
    return []; // Graceful degradation
  }
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
      fetchPromises.push(fetchGitlabIssues(params.languages, params.page));
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