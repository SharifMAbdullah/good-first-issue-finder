import { useSyncExternalStore, useCallback } from "react";
import {  getBookmarks, toggleBookmark } from "../lib/utils/bookmarkStorage";
import { UnifiedIssue } from "@/types/issues";
import { BookmarkDictionary } from "@/types/bookmark";

const EMPTY_SERVER_SNAPSHOT: BookmarkDictionary = {};

const subscribe = (callback: () => void): (() => void) => {
  window.addEventListener("bookmarksUpdated", callback);
  window.addEventListener("storage", callback);
  
  return (): void => {
    window.removeEventListener("bookmarksUpdated", callback);
    window.removeEventListener("storage", callback);
  };
};

const getSnapshot = (): BookmarkDictionary => {
  return getBookmarks();
};

const getServerSnapshot = (): BookmarkDictionary => {
  return EMPTY_SERVER_SNAPSHOT;
};

export interface UseBookmarksReturn {
  bookmarks: BookmarkDictionary;
  toggle: (issue: UnifiedIssue) => void;
  isBookmarked: (issueId: string) => boolean;
}

export const useBookmarks = (): UseBookmarksReturn => {
  const bookmarks: BookmarkDictionary = useSyncExternalStore<BookmarkDictionary>(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const toggle = useCallback((issue: UnifiedIssue): void => {
    toggleBookmark(issue);
  }, []);

  const isBookmarked = useCallback((issueId: string): boolean => {
    return !!bookmarks[issueId]; 
  }, [bookmarks]);

  const result: UseBookmarksReturn = {
    bookmarks,
    toggle,
    isBookmarked
  };

  return result;
};