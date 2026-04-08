import {
  FetchIssuesParams,
  UnifiedIssue,
  RawGitlabIssue,
} from "@/types/issues";
import {
  KNOWN_GITLAB_INSTANCES,
  GitlabInstance,
} from "@/lib/constants/gitLabInstances";
import { normalizeGitlabIssue, getGitlabSortParams } from "./gitlabMappers";

export class GitlabClient {
  public static async fetchAllInstances(
    params: FetchIssuesParams,
  ): Promise<UnifiedIssue[]> {
    const fetchPromises: Array<Promise<UnifiedIssue[]>> =
      KNOWN_GITLAB_INSTANCES.map(
        (instance: GitlabInstance): Promise<UnifiedIssue[]> =>
          this.fetchSingleInstance(params, instance),
      );

    const results: Array<Array<UnifiedIssue>> =
      await Promise.all(fetchPromises);
    return results.flat();
  }

  private static async fetchSingleInstance(
    params: FetchIssuesParams,
    instance: GitlabInstance,
  ): Promise<UnifiedIssue[]> {
    const controller: AbortController = new AbortController();
    const timeoutId: ReturnType<typeof setTimeout> = setTimeout((): void => {
      controller.abort();
    }, 3500);

    try {
      let apiUrl: string = `${instance.baseUrl}/api/v4/issues`;
      if (instance.path) {
        const encodedPath: string = encodeURIComponent(instance.path);
        apiUrl = `${instance.baseUrl}/api/v4/groups/${encodedPath}/issues`;
      }

      const glSort: { order_by: string; sort: string } = getGitlabSortParams(
        params.sort ?? "newest",
      );

      const searchParams: URLSearchParams = new URLSearchParams({
        scope: "all",
        state: "opened",
        order_by: glSort.order_by,
        sort: glSort.sort,
        per_page: "4",
        page: params.page.toString(),
      });

      if (instance.name === "GitLab") {
        searchParams.set("labels", "quick win");
      }

      if (params.query) {
        searchParams.set("search", params.query);
      }

      const url: string = `${apiUrl}?${searchParams.toString()}`;

      const headers: HeadersInit = {
        Accept: "application/json",
        "User-Agent": "OpenSource-Start-Tracker",
      };

      if (process.env.GITLAB_TOKEN) {
        headers["Authorization"] = `PRIVATE-TOKEN: ${process.env.GITLAB_TOKEN}`;
      }

      const response: Response = await fetch(url, {
        headers,
        next: { revalidate: 60 },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `GitLab API rejected request with status: ${response.status}`,
        );
      }

      const data: RawGitlabIssue[] = await response.json();
      return data.map(
        (issue: RawGitlabIssue): UnifiedIssue =>
          normalizeGitlabIssue(issue, instance.name),
      );
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        console.error(`[${instance.name}] GitLab fetch timed out after 3.5s.`);
        return [];
      }

      const msg: string =
        error instanceof Error ? error.message : String(error);
      console.error(`[${instance.name}] GitLab fetch failed:`, msg);
      return [];
    }
  }
}
