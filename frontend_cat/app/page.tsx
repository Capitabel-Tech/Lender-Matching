import Link from "next/link";

import { LiveRatesTicker } from "@/features/explore/LiveRatesTicker";
import { HeroSimulator } from "@/features/landing/HeroSimulator";
import { fetchLiveRates } from "@/lib/api/explore";

// The simulator's initial rate list and top-lender preview read current
// data at request time — without this, Next.js would pre-render this
// Server Component once at build time and the numbers would silently go
// stale between deploys.
export const dynamic = "force-dynamic";

const COMPARISON = [
  {
    label: "Credit inquiry",
    traditional: "Every bank you approach runs its own inquiry — each one can ding your score.",
    withUs: "Zero credit inquiries to see your matches. Only apply once you've picked a lender.",
  },
  {
    label: "Eligibility criteria",
    traditional: "Buried in the fine print — you find out you don't qualify after you've applied.",
    withUs: "See each lender's exact FOIR limit and eligibility rules before you apply, not after.",
  },
  {
    label: "Turnaround",
    traditional: "Days of back-and-forth, one bank at a time.",
    withUs: "Every eligible lender, compared side by side, in seconds.",
  },
] as const;

export default async function Landing() {
  const rates = await fetchLiveRates().catch(() => []);

  return (
    <div className="flex flex-1 flex-col bg-[#faf9f5] dark:bg-zinc-950">
      <header className="flex shrink-0 items-center justify-between px-6 py-5 sm:px-10">
        <span className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Lender<span className="text-teal-600 dark:text-teal-400">Match</span>
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/explore"
            className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 dark:bg-teal-600 dark:hover:bg-teal-500"
          >
            Explore Lenders
          </Link>
          <Link
            href="/admin"
            aria-label="Admin"
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-900/5 hover:text-teal-700 dark:hover:bg-white/5 dark:hover:text-teal-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pb-16 pt-6 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <HeroSimulator initialRates={rates} />
        </div>
      </section>

      <LiveRatesTicker />

      {/* Traditional route vs. with us */}
      <section className="px-6 py-24 sm:px-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Traditional bank route vs. with LenderMatch
          </h2>
          <div className="flex flex-col gap-4">
            {COMPARISON.map((row) => (
              <div
                key={row.label}
                className="grid gap-3 rounded-2xl border border-zinc-900/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-zinc-900 sm:grid-cols-[160px_1fr_1fr]"
              >
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{row.label}</p>
                <div className="flex gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <span className="mt-0.5 shrink-0 text-red-400">✕</span>
                  {row.traditional}
                </div>
                <div className="flex gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                  <span className="mt-0.5 shrink-0 text-teal-600 dark:text-teal-400">✓</span>
                  {row.withUs}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="flex flex-col items-center gap-6 bg-zinc-900 px-6 py-20 text-center dark:bg-zinc-900">
        <h2 className="text-3xl font-extrabold tracking-tight text-white">Ready to see your matches?</h2>
        <Link
          href="/explore"
          className="rounded-full bg-teal-500 px-8 py-4 text-lg font-bold text-zinc-950 hover:bg-teal-400"
        >
          Explore Lenders →
        </Link>
      </section>
    </div>
  );
}
