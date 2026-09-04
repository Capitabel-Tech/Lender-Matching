import type { Metadata } from "next";
import Link from "next/link";

import { ExplorePage } from "@/features/explore/ExplorePage";

export const metadata: Metadata = {
  title: "Explore Lenders",
  description: "Browse the loaded bank data by employment type and property filters.",
};

export default function Explore() {
  return (
    // Fixed to the viewport height from sm: up on purpose — ExplorePage
    // splits into two independently scrolling panes below the header at
    // that width, so scrolling the results never moves the filter sidebar
    // and vice versa. Below sm: the two panes stack instead, and a fixed,
    // clipped viewport height doesn't fit that: the sidebar would claim
    // all of it and the results below would be squeezed to zero height,
    // unreachable no matter how far you scroll (see ExplorePage.tsx's
    // matching comment) — so below sm: this is just a normal page that
    // scrolls as a whole.
    <div className="flex min-h-screen flex-col overflow-visible bg-zinc-50 dark:bg-zinc-950 sm:h-screen sm:overflow-hidden">
      <header className="flex shrink-0 items-center justify-between border-b border-teal-900 bg-zinc-900 px-6 py-4">
        <div>
          <Link
            href="/"
            className="mb-1.5 inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-teal-300"
          >
            ← Back to Home
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/" className="text-xl font-bold tracking-tight text-white hover:text-teal-300">
              Explore <span className="text-teal-400">Lenders</span>
            </Link>
            <span className="rounded-full border border-teal-800 bg-teal-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-400">
              Lender Match Engine v1.0
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Browse the loaded bank data by employment type and property filters.
          </p>
        </div>
        <Link
          href="/admin"
          aria-label="Admin login"
          title="Admin login"
          className="flex items-center gap-1.5 rounded-full px-3 py-2 text-zinc-400 hover:bg-zinc-800 hover:text-teal-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="text-xs font-semibold uppercase tracking-wide">Admin</span>
        </Link>
      </header>

      <div className="flex-1 sm:min-h-0">
        <ExplorePage />
      </div>
    </div>
  );
}
