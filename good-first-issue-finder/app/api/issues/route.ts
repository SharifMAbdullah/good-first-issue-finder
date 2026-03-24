// src/app/api/issues/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Platform, FetchIssuesParams, PaginatedResponse, RawGithubIssue, UnifiedIssue } from '@/types/issues';
import { normalizeGithubIssue } from '@/lib/adapters/issueAdapters';

// Helper to safely parse query arrays like ?platform=github&platform=gitlab
const parseArrayParam = (param: string | null): string[] => {
  if (!param) return [];
  return param.split(',').map((val: string): string => val.trim().toLowerCase());
};

const fetchGithubIssues = async (languages: string[], page: number): Promise<UnifiedIssue[]> => {
  // Constructing GitHub's specific search syntax
  const languageQuery: string = languages.length > 0 
    ? languages.map((lang: string): string => `language:${lang}`).join(' ') 
    : '';
  
  const searchQuery: string = `label:"good first issue" state:open ${languageQuery}`.trim();
  const encodedQuery: string = encodeURIComponent(searchQuery);
  const url: string = `https://api.github.com/search/issues?q=${encodedQuery}&per_page=20&page=${page}`;

  const response: Response = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` // Critical for production
    },
    next: { revalidate: 60 } // Cache results for 60 seconds to mitigate rate limits
  });

  if (!response.ok) {
    console.error(`GitHub API error: ${response.status}`);
    return [];
  }

  const data: { items: RawGithubIssue[] } = await response.json();
  return data.items.map((raw: RawGithubIssue): UnifiedIssue => normalizeGithubIssue(raw));
};

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    
    // 1. Validation & Parsing
    const platformsParam: string[] = parseArrayParam(searchParams.get('platforms'));
    const languagesParam: string[] = parseArrayParam(searchParams.get('languages'));
    const pageParam: number = parseInt(searchParams.get('page') || '1', 10);

    const params: FetchIssuesParams = {
      platforms: (platformsParam.length > 0 ? platformsParam : ['github']) as Platform[],
      languages: languagesParam,
      page: isNaN(pageParam) || pageParam < 1 ? 1 : pageParam,
    };

    // 2. Fetching
    const fetchPromises: Promise<UnifiedIssue[]>[] = [];

    if (params.platforms.includes('github')) {
      fetchPromises.push(fetchGithubIssues(params.languages, params.page));
    }
    
    if (params.platforms.includes('gitlab')) {
      // fetchPromises.push(fetchGitlabIssues(params.languages, params.page));
      // Gitlab implementation would go here, following the exact same pattern
    }

    // Await all platform requests concurrently
    const results: UnifiedIssue[][] = await Promise.all(fetchPromises);
    
    // 3. Aggregation
    const combinedIssues: UnifiedIssue[] = results.flat();

    // Sort combined results by newest first
    combinedIssues.sort((a: UnifiedIssue, b: UnifiedIssue): number => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const responsePayload: PaginatedResponse = {
      issues: combinedIssues,
      nextPage: combinedIssues.length > 0 ? params.page + 1 : null,
      totalCount: combinedIssues.length, // In a real app, you'd extract total counts from the raw APIs
    };

    return NextResponse.json(responsePayload);

  } catch (error: unknown) {
    const errorMessage: string = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}