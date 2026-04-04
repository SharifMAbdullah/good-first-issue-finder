"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBookmarks } from "@/hooks/useBookmarks";

export const Header = (): React.ReactElement => {
  const { bookmarks } = useBookmarks();
  const pathname: string = usePathname();
  
  // Calculate total bookmarks. Object.keys is safe and fast here.
  const bookmarkCount: number = Object.keys(bookmarks).length;
  const isFavoritesPage: boolean = pathname === "/favorites";

  return (
    <header className="mb-10 pb-6 border-b border-zinc-800/50 flex flex-col md:flex-row md:items-start justify-between gap-6">
      {/* Brand & Identity */}
      <div>
        <Link href="/" className="flex items-center gap-3 mb-2 group">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
            <span className="text-blue-500 font-bold text-lg">O</span>
          </div>
          <h1 className="text-3xl font-semibold text-white tracking-tight group-hover:text-zinc-200 transition-colors">
            Find Good First Issues To Contribute!
          </h1>
        </Link>
        <p className="text-zinc-500 text-sm max-w-xl">
          A unified dashboard for discovering Good First Issues across GitHub and GitLab. Select your stack and start contributing.
        </p>
      </div>

      {/* Navigation Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/favorites"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-200 ${
            isFavoritesPage
              ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
              : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-zinc-100"
          }`}
        >
          {/* SVG Star Icon */}
          <svg 
            className="w-4 h-4" 
            fill={isFavoritesPage ? "currentColor" : "none"} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <span className="font-medium">Favorites</span>
          
          {/* Dynamic Counter Badge */}
          {bookmarkCount > 0 && (
            <span className={`text-xs py-0.5 px-2 rounded-full font-bold ml-1 ${
              isFavoritesPage ? "bg-blue-500/20 text-blue-300" : "bg-zinc-800 text-zinc-300"
            }`}>
              {bookmarkCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};