import { RawGithubIssue, UnifiedIssue } from "@/types/issues";

export const normalizeGithubIssue = (raw: RawGithubIssue): UnifiedIssue => {
  return {
    id: raw.id.toString(),
    author: raw.author,
    platform: "github",
    title: raw.title,
    url: raw.html_url,
    repositoryName: raw.repository_url.split("/").slice(-2).join("/"),
    labels: raw.labels.map((label: { name: string }): string => label.name),
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    commentCount: raw.comments,
    // These will be populated later by the enrichment step if using REST
    language: null,
    repoStars: null,
    repoForks: null,
  };
};

export const getGithubSortParams = (sortBy: string): string => {
  switch (sortBy) {
    case "oldest":
      return "&sort=created&order=asc";
    case "updated":
      return "&sort=updated&order=desc";
    case "comments":
      return "&sort=comments&order=desc";
    default:
      return "&sort=created&order=desc";
  }
};
