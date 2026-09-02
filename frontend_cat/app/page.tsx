import { Fraunces } from "next/font/google";
import Link from "next/link";

import { LiveRatesTicker } from "@/features/explore/LiveRatesTicker";
import { HeroSimulator } from "@/features/landing/HeroSimulator";
import { fetchLiveRates } from "@/lib/api/explore";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["600"] });

// The simulator's initial rate list and top-lender preview read current
// data at request time — without this, Next.js would pre-render this
// Server Component once at build time and the numbers would silently go
// stale between deploys.
export const dynamic = "force-dynamic";

const NAV_LINKS = [
  { label: "Home Loans", href: "/explore" },
  { label: "Personal", href: "#" },
  { label: "About", href: "#" },
] as const;

function CreditInquiryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function EligibilityIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18M9 4v16" />
    </svg>
  );
}

function PropertyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}

function TurnaroundIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

const WHAT_HAPPENS = [
  { Icon: CreditInquiryIcon, label: "Credit Inquiry", sub: "Zero credit inquiries" },
  { Icon: EligibilityIcon, label: "Eligibility Check", sub: "See it before you apply" },
  { Icon: PropertyIcon, label: "Property Match", sub: "Matched to your property" },
  { Icon: TurnaroundIcon, label: "Turnaround", sub: "Results in seconds" },
] as const;

export default async function Landing() {
  const rates = await fetchLiveRates().catch(() => []);

  return (
    <div className="flex flex-1 flex-col bg-[#faf9f5] dark:bg-zinc-950">
      <header className="flex shrink-0 items-center justify-between px-6 py-5 sm:px-10">
        <span className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Lender<span className="text-teal-600 dark:text-teal-400">Match</span>
        </span>
        <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-300 md:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="hover:text-zinc-900 dark:hover:text-zinc-50">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/login"
            className="hidden rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-900/5 dark:border-zinc-700 dark:text-zinc-200 sm:inline-block"
          >
            Sign In
          </Link>
          <Link
            href="/explore"
            className="rounded-full bg-teal-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-900"
          >
            Check EMI
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

      {/* What happens: traditional route vs. with us */}
      <section className="px-6 py-24 sm:px-10">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-teal-700 dark:text-teal-400">
              What Happens
            </p>
            <h2 className={`${fraunces.className} mt-2 text-3xl leading-tight text-zinc-900 dark:text-zinc-50`}>
              Traditional Bank Route vs. With LenderMatch
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {WHAT_HAPPENS.map(({ Icon, label, sub }) => (
              <div
                key={label}
                className="flex flex-col gap-2 rounded-2xl border border-zinc-900/5 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-zinc-900"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
                  <Icon />
                </span>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{label}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="flex flex-col items-center gap-6 bg-teal-950 px-6 py-20 text-center">
        <h2 className={`${fraunces.className} text-3xl text-white`}>Ready to see your matches?</h2>
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
