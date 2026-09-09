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
      <div className="flex min-h-screen flex-col overflow-visible sm:h-screen sm:overflow-hidden">
        <header className="flex shrink-0 items-center justify-between border-b border-[#E2E8F0] bg-white px-6 py-4 z-10 relative shadow-sm">
          <div>
            <Link
              href="/"
              className="mb-1.5 inline-flex items-center gap-1 text-xs font-bold text-[#5F75A0] hover:text-[#16264D] transition-colors"
            >
              ← Back to Home
            </Link>
            <div className="flex flex-wrap items-center gap-3 mt-0.5">
              <Link href="/" className="text-2xl font-extrabold tracking-tight text-[#16264D]">
                Lender<span className="text-[#F58220]">Match</span> Engine
              </Link>
              <span className="rounded-full border border-[#F58220]/20 bg-[#F58220]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#F58220]">
                Live Mode
              </span>
            </div>
            <p className="text-xs font-medium text-[#5F75A0] mt-1.5">
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
