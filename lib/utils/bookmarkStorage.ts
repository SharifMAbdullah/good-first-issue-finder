import { BookmarkDictionary } from "@/types/bookmark";
import { UnifiedIssue } from "@/types/issues";

const STORAGE_KEY: string = "gfif_bookmarks";
// export type BookmarkDictionary = Record<string, UnifiedIssue>;

let memoizedBookmarks: BookmarkDictionary = {};
let lastSerializedData: string | null = null;

export const getBookmarks = (): BookmarkDictionary => {
  if (typeof window === "undefined") return {};

  const currentSerialized: string | null = localStorage.getItem(STORAGE_KEY);

  if (currentSerialized === lastSerializedData) {
    return memoizedBookmarks;
  }

  try {
    const parsed: unknown = currentSerialized ? JSON.parse(currentSerialized) : {};
    lastSerializedData = currentSerialized;
    // Basic type narrowing. In a production environment, you might run this through a Zod schema.
    memoizedBookmarks = (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) 
      ? (parsed as BookmarkDictionary) 
      : {};
    return memoizedBookmarks;
  } catch {
    return {};
  }
};

export const toggleBookmark = (issue: UnifiedIssue): void => {
  if (typeof window === "undefined") return;

  const current: BookmarkDictionary = getBookmarks();
  const updated: BookmarkDictionary = { ...current };

  if (updated[issue.id]) {
    // If it exists, remove it
    delete updated[issue.id];
  } else {
    // If it doesn't exist, add the full object
    updated[issue.id] = issue;
  }

  localStorage.setItem("gfif_bookmarks", JSON.stringify(updated));
  window.dispatchEvent(new Event("bookmarksUpdated"));
};