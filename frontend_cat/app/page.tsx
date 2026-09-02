import { Fraunces } from "next/font/google";
import Link from "next/link";

import { LiveRatesTicker } from "@/features/explore/LiveRatesTicker";
import { fetchLiveRates } from "@/lib/api/explore";

// Scoped to just this page — the rest of the app keeps Geist Sans as its
// working-tool typeface; this serif is purely for the landing page's
// editorial, storefront feel (see the design reference this was built
// against: birbal.club's serif-headline/light-gradient hero style).
const fraunces = Fraunces({ subsets: ["latin"], weight: ["500", "600"], style: ["normal", "italic"] });

// The hero's live-rate stat reads current data at request time — without
// this, Next.js would pre-render this Server Component once at build time
// and the number would silently go stale between deploys.
export const dynamic = "force-dynamic";

const STEPS = [
  {
    n: "01",
    title: "Tell us about yourself",
    body: "Age, income, property type, and how much you need — that's it.",
  },
  {
    n: "02",
    title: "We check every lender",
    body: "Matched instantly against each bank's real eligibility rules, not a guess.",
  },
  {
    n: "03",
    title: "Compare and choose",
    body: "See the exact EMI, tenure, and rate for every eligible bank, side by side.",
  },
] as const;

const BENEFITS = [
  {
    title: "No bias toward one lender",
    body: "Matches are ranked purely by your eligibility and rate — not by who pays us more.",
  },
  {
    title: "Live data, not a rate-card fiction",
    body: "Rates are checked against banks' own published numbers, not a static list someone typed in once.",
  },
  {
    title: "Everything in one place",
    body: "Compare EMI, FOIR, tenure, and property eligibility across every lender at once — no visiting bank after bank.",
  },
] as const;

export default async function Landing() {
  // Best-effort — the hero still reads fine with generic copy if the
  // backend's briefly unreachable, so a failed fetch here should never
  // break the page.
  const rates = await fetchLiveRates().catch(() => []);
  const lowestRate = rates[0] ?? null;
  const previewRates = rates.slice(0, 3);

  return (
    <div className="flex flex-1 flex-col bg-[#faf8f3] dark:bg-zinc-950">
      <header className="flex shrink-0 items-center justify-between px-6 py-5 sm:px-10">
        <span className={`${fraunces.className} text-xl text-zinc-900 dark:text-zinc-50`}>
          Lender <span className="text-teal-600 dark:text-teal-400">Match</span>
        </span>
        <div className="flex items-center gap-4">
          <Link
            href="/explore"
            className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-teal-600/20 hover:bg-teal-700"
          >
            Explore Lenders →
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
        <div className="mx-auto grid max-w-6xl items-center gap-12 rounded-[2.5rem] bg-gradient-to-br from-teal-50 via-white to-teal-50/60 p-10 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_60px_-20px_rgba(13,148,136,0.25)] dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 sm:p-16 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            {rates.length > 0 && (
              <p className={`${fraunces.className} text-xl text-teal-600 dark:text-teal-400`}>
                {rates.length}+ lenders tracked, live.
              </p>
            )}
            <h1 className={`${fraunces.className} text-4xl leading-[1.15] text-zinc-900 dark:text-zinc-50 sm:text-5xl`}>
              Find your matching lender, not a guess.
            </h1>
            <p className={`${fraunces.className} max-w-md text-xl italic text-zinc-500 dark:text-zinc-400`}>
              &ldquo;Real eligibility rules. Real interest rates. Matched to you.&rdquo;
            </p>
            <div>
              <Link
                href="/explore"
                className="inline-block rounded-full bg-teal-600 px-7 py-3.5 text-base font-semibold text-white shadow-sm shadow-teal-600/30 hover:bg-teal-700"
              >
                Explore Lenders →
              </Link>
            </div>
          </div>

          {/* Real matched-lender preview — actual live data, not a mockup */}
          {previewRates.length > 0 && (
            <div className="flex flex-col gap-3">
              {previewRates.map((r, i) => (
                <div
                  key={r.bank_name}
                  className="flex items-center justify-between rounded-2xl border border-teal-900/5 bg-white/80 px-5 py-4 shadow-sm backdrop-blur dark:border-white/5 dark:bg-zinc-900/80"
                  style={{ marginLeft: i * 16 }}
                >
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{r.bank_name}</p>
                    <p className="text-xs text-zinc-400">Home loan · verified live</p>
                  </div>
                  <p className={`${fraunces.className} text-2xl text-teal-600 dark:text-teal-400`}>
                    {r.rate_pct.toFixed(2)}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        {lowestRate && (
          <p className="mx-auto mt-6 flex max-w-6xl items-center justify-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
            </span>
            Rates start from <span className="font-semibold text-teal-700 dark:text-teal-400">{lowestRate.rate_pct.toFixed(2)}%</span>, checked against banks&rsquo; own published numbers.
          </p>
        )}
      </section>

      <LiveRatesTicker />

      {/* How it works */}
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-24 sm:px-10">
        <h2 className={`${fraunces.className} text-center text-3xl text-zinc-900 dark:text-zinc-50`}>How it works</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.n}
              className="flex flex-col gap-3 rounded-3xl border border-zinc-900/5 bg-white p-7 shadow-sm dark:border-white/5 dark:bg-zinc-900"
            >
              <span className={`${fraunces.className} text-3xl text-teal-600 dark:text-teal-400`}>{step.n}</span>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{step.title}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why this vs. going bank to bank */}
      <section className="bg-teal-950 px-6 py-24 sm:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
          <h2 className={`${fraunces.className} text-center text-3xl text-white`}>Why not just call the bank?</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {BENEFITS.map((b) => (
              <div key={b.title} className="flex flex-col gap-2">
                <h3 className="text-base font-semibold text-teal-300">{b.title}</h3>
                <p className="text-sm text-teal-100/70">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="flex flex-col items-center gap-6 px-6 py-24 text-center">
        <h2 className={`${fraunces.className} text-3xl text-zinc-900 dark:text-zinc-50`}>Ready to see your matches?</h2>
        <Link
          href="/explore"
          className="rounded-full bg-teal-600 px-8 py-4 text-lg font-semibold text-white shadow-sm shadow-teal-600/30 hover:bg-teal-700"
        >
          Explore Lenders →
        </Link>
      </section>
    </div>
  );
}
