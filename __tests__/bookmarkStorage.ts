import { getBookmarks, toggleBookmark } from "../lib/utils/bookmarkStorage";

describe("bookmarkStorage utility", (): void => {
  beforeEach((): void => {
    localStorage.clear();
  });

  it("should return an empty array when no bookmarks exist", (): void => {
    const result: Array<string> = getBookmarks();
    expect(result).toEqual([]);
  });

  it("should add a bookmark if it does not exist", (): void => {
    const result: Array<string> = toggleBookmark("issue-123");
    expect(result).toContain("issue-123");
  });

  it("should remove a bookmark if it already exists", (): void => {
    toggleBookmark("issue-123");
    const result: Array<string> = toggleBookmark("issue-123");
    expect(result).not.toContain("issue-123");
  });
});