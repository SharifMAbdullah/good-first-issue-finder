import {
  FetchIssuesParams,
  UnifiedIssue,
  RawGithubIssue,
} from "@/types/issues";
import { normalizeGithubIssue, getGithubSortParams } from "./githubMappers";

interface RepoMetrics {
  language: string | null;
  stars: number;
  forks: number;
}

export class GithubClient {
  public static async fetchIssues(
    params: FetchIssuesParams,
  ): Promise<UnifiedIssue[]> {
    const languageQuery: string =
      params.languages.length > 0
        ? params.languages
            .map((lang: string): string => `language:${lang}`)
            .join(" ")
        : "";

    const queryStr: string = params.query ?? "";
    const searchQuery: string =
      `label:"good first issue" state:open ${languageQuery} ${queryStr}`.trim();
    const encodedQuery: string = encodeURIComponent(searchQuery);

    const sortParams: string = getGithubSortParams(params.sort ?? "newest");
    const url: string = `https://api.github.com/search/issues?q=${encodedQuery}&per_page=20&page=${params.page}${sortParams}`;

    try {
      const response: Response = await fetch(url, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "User-Agent": "OpenSource-Start-Tracker",
        },
        next: { revalidate: 60 },
      });

      if (!response.ok) {
        throw new Error(`GitHub API Status ${response.status}`);
      }

      const data: { items: RawGithubIssue[] } = await response.json();
      const mappedIssues: UnifiedIssue[] = data.items.map(
        (raw: RawGithubIssue): UnifiedIssue => normalizeGithubIssue(raw),
      );

      // Note: This is the N+1 bottleneck.
      // It is kept here for parity with your PR, but should be replaced by a Redis cache or GraphQL.
      const includeMetrics: boolean =
        params.sort === "stars" || params.sort === "forks";
      return await this.enrichWithRepoData(mappedIssues, includeMetrics);
    } catch (error: unknown) {
      console.error("Error fetching Github Issues: ", error);
      return [];
    }
  }

  private static async enrichWithRepoData(
    issues: UnifiedIssue[],
    includeStarsForks: boolean,
  ): Promise<UnifiedIssue[]> {
    const uniqueRepos: string[] = [
      ...new Set(issues.map((i: UnifiedIssue): string => i.repositoryName)),
    ];
    const repoDataMap: Map<string, RepoMetrics> = new Map();

    const fetchPromises: Promise<void>[] = uniqueRepos.map(
      async (repoName: string): Promise<void> => {
        try {
          const res: Response = await fetch(
            `https://api.github.com/repos/${repoName}`,
            {
              headers: {
                Accept: "application/vnd.github.v3+json",
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                "User-Agent": "OpenSource-Start-Tracker",
              },
              next: { revalidate: 300 },
            },
          );

          if (res.ok) {
            const data: {
              language?: string | null;
              stargazers_count?: number;
              forks_count?: number;
            } = await res.json();
            repoDataMap.set(repoName, {
              language: data.language ?? null,
              stars: data.stargazers_count ?? 0,
              forks: data.forks_count ?? 0,
            });
          }
        } catch (error: unknown) {
          console.log(error)
        }
      },
    );

    await Promise.all(fetchPromises);

    return issues.map((issue: UnifiedIssue): UnifiedIssue => {
      const repoData: RepoMetrics | undefined = repoDataMap.get(
        issue.repositoryName,
      );
      return {
        ...issue,
        language: repoData?.language ?? null,
        ...(includeStarsForks
          ? {
              repoStars: repoData?.stars ?? null,
              repoForks: repoData?.forks ?? null,
            }
          : {}),
      };
    });
  }
}
