import type { Metadata } from "next";
import Link from "next/link";

import { HeaderActions } from "@/features/auth/HeaderActions";
import { RequireAuth } from "@/features/auth/RequireAuth";
import { ExplorePage } from "@/features/explore/ExplorePage";

export const metadata: Metadata = {
  title: "Explore Lenders",
  description: "Browse the loaded bank data by employment type and property filters.",
};

export default function Explore() {
  // Fixed to the viewport height from sm: up on purpose — ExplorePage
  // splits into two independently scrolling panes below the header at
  // that width, so scrolling the results never moves the filter sidebar
  // and vice versa. Below sm: the two panes stack instead, and a fixed,
  // clipped viewport height doesn't fit that: the sidebar would claim
  // all of it and the results below would be squeezed to zero height,
  // unreachable no matter how far you scroll (see ExplorePage.tsx's
  // matching comment) — so below sm: this is just a normal page that
  // scrolls as a whole.
  return (
    <RequireAuth>
      <div className="flex min-h-screen flex-col overflow-visible bg-cream-100 dark:bg-brand-950 sm:h-screen sm:overflow-hidden">
        <header className="flex shrink-0 items-center justify-between border-b border-brand-900 bg-brand-800 px-6 py-4">
          <div>
            <Link
              href="/"
              className="mb-1.5 inline-flex items-center gap-1 text-xs font-semibold text-brand-300 hover:text-brand-300"
            >
              ← Back to Home
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/" className="text-xl font-bold tracking-tight text-white hover:text-brand-300">
                Explore <span className="text-brand-400">Lenders</span>
              </Link>
              <span className="rounded-full border border-brand-800 bg-brand-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-400">
                Lender Match Engine v1.0
              </span>
            </div>
            <p className="text-xs text-brand-300">
              Browse the loaded bank data by employment type and property filters.
            </p>
          </div>
          <HeaderActions />
        </header>

        <div className="flex-1 sm:min-h-0">
          <ExplorePage />
        </div>
      </div>
    </RequireAuth>
  );
}
