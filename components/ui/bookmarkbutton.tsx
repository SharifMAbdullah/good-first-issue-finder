// src/components/ui/bookmarkbutton.tsx
"use client";

import React from "react";
import { Star } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { BookmarkButtonProps } from "@/types/bookmark";

export const BookmarkButton: React.FC<BookmarkButtonProps> = (props: BookmarkButtonProps): React.ReactElement => {  const { toggle, isBookmarked } = useBookmarks();
  const active: boolean = isBookmarked(props.issue.id);

  return (
    <button
      onClick={(e: React.MouseEvent): void => {
        e.stopPropagation();
        e.preventDefault();
        toggle(props.issue);
      }}
      className={`transition-all duration-200 ${
        active ? "text-yellow-500 scale-110" : "text-zinc-600 hover:text-zinc-400"
      }`}
      title={active ? "Remove from bookmarks" : "Save for later"}
    >
      <Star size={16} fill={active ? "currentColor" : "none"} />
    </button>
  );
};