"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useBookmarks } from "@/hooks/useBookmarks";
import { ResultCard } from "@/components/search/ResultCard";
import { UnifiedIssue } from "@/types/issues";
import { Header } from "@/components/ui/header";

export default function FavoritesPage(): React.ReactElement {
  const { bookmarks }: ReturnType<typeof useBookmarks> = useBookmarks();
  const router: AppRouterInstance = useRouter();

  const savedIssues: Array<UnifiedIssue> = useMemo((): Array<UnifiedIssue> => {
    return Object.values(bookmarks);
  }, [bookmarks]);

  const handleTagClick = (tag: string): void => {
    router.push(`/?q=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-200 p-6 md:p-12 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto">
        
        {/* Consistent Navigation */}
        <Header />

        <div className="mb-8 mt-4">
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">Saved Issues</h2>
          <p className="text-zinc-400">Your personal collection of open-source opportunities offline.</p>
        </div>

        {savedIssues.length === 0 ? (
          <div className="p-12 text-center bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
            <p className="text-zinc-400 text-lg">You haven`&quot;`t saved any issues yet.</p>
            <p className="text-zinc-500 text-sm mt-2">
              Click the star icon on any issue to save it for later.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {savedIssues.map((issue: UnifiedIssue): React.ReactElement => (
              <ResultCard
                key={`favorite-${issue.id}`}
                issue={issue}
                onTagClick={handleTagClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}