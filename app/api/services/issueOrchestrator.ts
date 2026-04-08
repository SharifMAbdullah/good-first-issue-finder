import {
  FetchIssuesParams,
  PaginatedResponse,
  UnifiedIssue,
} from "@/types/issues";
import { GithubClient } from "./github/githubClient";
import { GitlabClient } from "./gitlab/gitlabClient";

export class IssueOrchestrator {
  public static async getUnifiedIssues(
    params: FetchIssuesParams,
  ): Promise<PaginatedResponse> {
    const fetchPromises: Array<Promise<UnifiedIssue[]>> = [];

    if (params.platforms.includes("github")) {
      fetchPromises.push(GithubClient.fetchIssues(params));
    }

    if (params.platforms.includes("gitlab")) {
      fetchPromises.push(GitlabClient.fetchAllInstances(params));
    }

    const results: Array<Array<UnifiedIssue>> =
      await Promise.all(fetchPromises);
    const combinedIssues: Array<UnifiedIssue> = results.flat();

    this.sortIssues(combinedIssues, params.sort ?? "newest");

    return {
      issues: combinedIssues,
      nextPage: combinedIssues.length > 0 ? params.page + 1 : null,
      totalCount: combinedIssues.length,
    };
  }

  private static sortIssues(issues: Array<UnifiedIssue>, sortBy: string): void {
    issues.sort((a: UnifiedIssue, b: UnifiedIssue): number => {
      switch (sortBy) {
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "updated":
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case "comments":
          return b.commentCount - a.commentCount;
        case "stars":
          return (b.repoStars ?? 0) - (a.repoStars ?? 0);
        case "forks":
          return (b.repoForks ?? 0) - (a.repoForks ?? 0);
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });
  }
}
