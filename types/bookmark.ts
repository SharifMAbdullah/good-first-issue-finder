import { UnifiedIssue } from "./issues";

export interface BookmarkDictionary {
  [key: string]: UnifiedIssue;
}

export interface BookmarkButtonProps {
  issue: UnifiedIssue;
}
