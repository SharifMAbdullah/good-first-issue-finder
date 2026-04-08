import { RawGitlabIssue, UnifiedIssue } from "@/types/issues";

export const normalizeGitlabIssue = (
  raw: RawGitlabIssue,
  instanceName: string,
): UnifiedIssue => {
  return {
    id: `${instanceName}-${raw.id}`,
    author: raw.author,
    platform: "gitlab",
    title: raw.title,
    url: raw.web_url,
    repositoryName: raw.references?.full || "Unknown Project",
    labels: raw.labels || [],
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    commentCount: raw.user_notes_count,
    language: null,
    repoStars: raw.upvotes, // Using upvotes as a proxy for stars on GitLab
    repoForks: null,
  };
};

interface GitlabSortConfig {
  order_by: string;
  sort: string;
}

export const getGitlabSortParams = (sortBy: string): GitlabSortConfig => {
  switch (sortBy) {
    case "oldest":
      return { order_by: "created_at", sort: "asc" };
    case "updated":
      return { order_by: "updated_at", sort: "desc" };
    default:
      return { order_by: "created_at", sort: "desc" };
  }
};
