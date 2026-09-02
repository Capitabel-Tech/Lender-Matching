import Link from "next/link";

import { LiveRatesTicker } from "@/features/explore/LiveRatesTicker";
import { fetchLiveRates } from "@/lib/api/explore";

// The hero's "Rates start from X% today, verified live" line reads the
// current lowest rate at request time — without this, Next.js would
// pre-render this Server Component once at build time and the number would
// silently go stale between deploys instead of actually being "today's."
export const dynamic = "force-dynamic";

function Logo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xl font-bold tracking-tight text-white">
        Lender <span className="text-teal-400">Match Engine</span>
      </span>
      <span className="rounded-full border border-teal-800 bg-teal-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-400">
        v1.0
      </span>
    </div>
  );
}

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
  // Best-effort — the hero still works fine with generic copy if the
  // backend's briefly unreachable, so a failed fetch here should never
  // break the page.
  const lowestRate = await fetchLiveRates()
    .then((rates) => rates[0]?.rate_pct ?? null)
    .catch(() => null);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="flex shrink-0 items-center justify-between border-b border-teal-900 bg-zinc-900 px-6 py-4">
        <Logo />
        <div className="flex items-center gap-4">
          <Link
            href="/explore"
            className="rounded-full bg-teal-500 px-4 py-2 text-sm font-bold text-zinc-950 hover:bg-teal-400"
          >
            Explore Lenders
          </Link>
          <Link
            href="/admin"
            aria-label="Admin"
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-teal-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Hero — always dark, matches the header, for a strong first
          impression regardless of the visitor's light/dark preference. */}
      <section className="flex flex-col items-center gap-8 bg-zinc-950 px-6 py-24 text-center sm:py-32">
        <span className="rounded-full border border-teal-800 bg-teal-950/60 px-3 py-1 text-xs font-bold uppercase tracking-widest text-teal-400">
          Lender Match Engine
        </span>
        <h1 className="max-w-4xl text-4xl font-black leading-[1.1] tracking-tight text-white sm:text-6xl">
          Stop guessing which bank
          <br />
          will actually <span className="text-teal-400">approve you.</span>
        </h1>
        <p className="max-w-xl text-lg text-zinc-400">
          Tell us your income, property, and loan amount — we check it against every lender&rsquo;s real eligibility
          rules and live interest rates instantly, not a generic rate card.
        </p>
        <Link
          href="/explore"
          className="rounded-full bg-teal-500 px-8 py-4 text-lg font-black text-zinc-950 shadow-lg shadow-teal-500/20 hover:bg-teal-400"
        >
          Explore Lenders →
        </Link>
        {lowestRate !== null && (
          <p className="flex items-center gap-2 text-sm font-semibold text-zinc-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            Rates start from <span className="text-teal-400">{lowestRate.toFixed(2)}%</span> today, verified live.
          </p>
        )}
      </section>

      <LiveRatesTicker />

      {/* How it works */}
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-20">
        <h2 className="text-center text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
          How it works
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.n}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span className="text-3xl font-black text-teal-500">{step.n}</span>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{step.title}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why this vs. going bank to bank */}
      <section className="bg-zinc-100 px-6 py-20 dark:bg-zinc-900">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
          <h2 className="text-center text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Why not just call the bank?
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {BENEFITS.map((b) => (
              <div key={b.title} className="flex flex-col gap-2">
                <h3 className="text-base font-bold text-teal-600 dark:text-teal-400">{b.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="flex flex-col items-center gap-6 bg-zinc-950 px-6 py-20 text-center">
        <h2 className="text-3xl font-black tracking-tight text-white">Ready to see your matches?</h2>
        <Link
          href="/explore"
          className="rounded-full bg-teal-500 px-8 py-4 text-lg font-black text-zinc-950 shadow-lg shadow-teal-500/20 hover:bg-teal-400"
        >
          Explore Lenders →
        </Link>
      </section>
    </div>
  );
}
