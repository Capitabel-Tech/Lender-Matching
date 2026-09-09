"use client";

import { Space_Grotesk } from "next/font/google";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  EMPTY_FILTERS,
  exploreBanks,
  fetchCategories,
  fetchLiveRates,
  type ExploreResponse,
  type LiveRate,
} from "@/lib/api/explore";
import { useAuth } from "@/lib/useAuth";

import { BeforeAfter } from "./BeforeAfter";
import { ExploreModePreview } from "./ExploreModePreview";
import { FeatureCards } from "./FeatureCards";
import { LendersFlow, LendersFlowMobile } from "./LendersFlow";
import { MatchScore } from "./MatchScore";
import { Metrics } from "./Metrics";
import { Reveal } from "./Reveal";
import { VerifiedRatesTicker, type TickerRate } from "./VerifiedRatesTicker";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

// "Product" used to be a 3rd nav link straight to /explore — dropped since
// the "Check eligibility" button right next to this nav already goes
// there; having both said the same thing twice. These three are same-page
// anchors, a genuinely different kind of link.
const NAV_LINKS = [
  { label: "The Engine", href: "#how-it-works" },
  { label: "Bank Network", href: "#lenders" },
  { label: "Live Ranking", href: "#live-ranking" },
] as const;

// Fetched client-side, after RequireAuth (see app/page.tsx) confirms a real
// login — unlike before, when this page was a Server Component fetching at
// request time. A Server Component can't carry the browser's Firebase
// token, and Explore Lenders' data now requires one (require_any_role), so
// the fetch has to happen here instead, with a token in hand.
export function LandingContent() {
  const { getToken } = useAuth();
  const [rates, setRates] = useState<LiveRate[]>([]);
  const [banksRes, setBanksRes] = useState<ExploreResponse | null>(null);
  const [categoryValueCount, setCategoryValueCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // getToken can throw (e.g. a transient "Database is closing" from
      // Firebase's IndexedDB layer) — this page is public, so a logged-out
      // or token-less visitor is completely normal, not an error to
      // surface; either way, fall back to no token rather than letting the
      // rejection escape unhandled.
      const token = await getToken().catch(() => null);
      const [ratesResult, banksResult, categoriesResult] = await Promise.all([
        fetchLiveRates(token).catch(() => []),
        exploreBanks(EMPTY_FILTERS, token).catch(() => null),
        fetchCategories(token).catch(() => null),
      ]);
      if (cancelled) return;
      setRates(ratesResult);
      setBanksRes(banksResult);
      setCategoryValueCount(
        categoriesResult
          ? Object.entries(categoriesResult).reduce(
              (sum, [key, value]) => (key === "property_type_groups" ? sum : sum + (value as unknown[]).length),
              0,
            )
          : 0,
      );
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getToken is stable across renders
  }, []);

  const bankNames = banksRes ? [...new Set(banksRes.results.map((p) => p.bank_name))] : rates.map((r) => r.bank_name);
  const bankCount = bankNames.length;
  const productCount = banksRes?.results.length ?? 0;
  const topMatchName = rates[0]?.bank_name ?? null;
  const topMatchRate = rates[0]?.rate_pct ?? null;
  const networkNodeNames = bankNames.slice(0, 16);

  // Ticker shows both confirmed and estimated rates, tagged — unlike the
  // tool's own LiveRatesTicker, which deliberately only shows confirmed
  // ones (see its docstring). Deduped to the lowest rate per bank.
  const tickerRates: TickerRate[] = banksRes
    ? Object.values(
        banksRes.results.reduce<Record<string, TickerRate>>((acc, p) => {
          const existing = acc[p.bank_name];
          if (!existing || p.interest_rate_pct < existing.ratePct) {
            acc[p.bank_name] = { bankName: p.bank_name, ratePct: p.interest_rate_pct, isEstimated: p.interest_rate_is_estimated };
          }
          return acc;
        }, {}),
      ).sort((a, b) => a.ratePct - b.ratePct)
    : [];

  const metrics = [
    { value: String(bankCount), label: "Lenders" },
    { value: `${categoryValueCount}+`, label: "Eligibility Values" },
    { value: `${productCount}+`, label: "Loan Products" },
    { value: "Seconds", label: "To Match" },
  ];

  return (
    // pb-14 leaves just enough room at the very bottom for the fixed ticker
    // below so it never sits on top of the final CTA's own buttons.
    <div className={`${spaceGrotesk.className} flex flex-1 flex-col pb-14 text-[#16264D]`}>
      {/* Header — minimal, floating, transparent + blur */}
      <header className="sticky top-0 z-50 flex shrink-0 items-center justify-between border-b border-brand-100 bg-white/80 px-6 py-4 backdrop-blur-md sm:px-10">
        <span className="text-2xl font-extrabold tracking-tight">
          Lender<span className="text-[#F58220]">Match</span> Engine
        </span>
        <nav className="hidden items-center gap-4 text-sm md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="rounded-full bg-[#16264D] px-6 py-2.5 font-extrabold text-white shadow-md transition-all hover:bg-[#223760] hover:scale-105 hover:shadow-lg"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/explore"
            className="group inline-flex items-center gap-1.5 rounded-full bg-[#F58220] px-4 py-2 text-sm font-semibold text-[#0F1A33] shadow-[0_0_20px_rgba(245,130,32,0.35)] transition-transform hover:scale-[1.03]"
          >
            Check eligibility <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-24 pt-20 sm:px-10 sm:pt-28 lg:pl-48">
        <div className="relative flex w-full max-w-7xl flex-col items-start gap-7 text-left">
          <p className="inline-block text-base sm:text-lg font-bold uppercase tracking-[0.15em] text-[#F58220] bg-[#F58220]/10 border border-[#F58220]/20 px-5 py-2 rounded-full">
            Rule-Based Lender Matching Engine
          </p>
          <h1 className="text-[44px] font-bold leading-[1.1] tracking-tight sm:text-[60px] lg:text-[72px]">
            One Profile. Every Lender.
            <br />
            <span className="font-serif italic text-[#F58220]">Your Best Match.</span>
          </h1>
          <p className="max-w-lg text-lg text-brand-500">
            The engine that calculates <strong className="font-semibold text-[#16264D]">real eligibility</strong> and{" "}
            <strong className="font-semibold text-[#16264D]">true affordability</strong> across {bankCount || "24"}+
            lenders in seconds. Stop guessing. Start matching.
          </p>
          {/* Just this one hero CTA now, plus the nav's own "Check eligibility" —
              both went to /explore, and a 3rd/4th button here ("Explore Live
              Rates", a "Product" nav link) said the same thing again. */}
          <div className="flex flex-wrap items-center justify-start gap-4">
            <Link
              href="/explore"
              className="group inline-flex items-center gap-2 rounded-full bg-[#F58220] px-7 py-3.5 text-base font-semibold text-[#0F1A33] shadow-[0_0_30px_rgba(245,130,32,0.35)] transition-transform hover:scale-[1.03]"
            >
              Check Your Eligibility <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
          <p className="text-xs uppercase tracking-wide text-brand-500">
            No hard credit inquiry &nbsp;•&nbsp; Rule-based matching &nbsp;•&nbsp; Results in seconds
          </p>
        </div>
      </section>

      {/* How the engine thinks — 3 feature cards */}
      <section id="how-it-works" className="border-t border-brand-100 bg-cream-50 px-6 py-24 sm:px-10 lg:pl-48 lg:pr-48">
        <Reveal className="flex w-full flex-col gap-12">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-[#16264D]">How the Engine Thinks</h2>
          <FeatureCards />
        </Reveal>
      </section>

      {/* Explore Mode preview */}
      <section className="px-6 py-24 sm:px-10 lg:pl-48 lg:pr-48">
        <Reveal className="flex w-full flex-col gap-10">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-[#16264D]">Interactive Lender Match</h2>
            <p className="mt-3 max-w-2xl text-lg text-brand-500">
              Play with the rules yourself. Toggle employment types, loan amounts, and property filters in real-time, and watch our engine calculate exactly which of our {bankCount || "24"}+ lenders will accept your application. No guesswork, just hard data.
            </p>
          </div>
          <ExploreModePreview bankCount={bankCount} sampleBankName={topMatchName} sampleRatePct={topMatchRate} />
        </Reveal>
      </section>

      {/* One engine, every lender's rules */}
      <section id="lenders" className="border-t border-brand-100 bg-cream-50 px-6 py-24 sm:px-10 lg:pl-48 lg:pr-48">
        <Reveal className="flex w-full flex-col items-start gap-14 text-left">
          <div className="flex flex-col gap-6 max-w-4xl">
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-[#16264D]">
              One Unified Engine.<br />
              Every Lender's Exact Rules.
            </h2>
            <p className="text-lg leading-relaxed text-[#5F75A0] font-medium">
              We&rsquo;ve codified the strict underwriting policies of India&rsquo;s top financial institutions into a single, high-speed matching algorithm. By cross-referencing your unique profile against hundreds of hidden banking parameters, we instantly identify the lenders most likely to approve and fund your loan.
            </p>
          </div>
          <LendersFlow names={networkNodeNames} />
          <LendersFlowMobile names={networkNodeNames} />
        </Reveal>
      </section>

      {/* Match score */}
      <section id="live-ranking" className="px-6 py-24 sm:px-10 lg:pl-48 lg:pr-48">
        <Reveal className="flex w-full flex-col gap-10">
          <div className="text-left max-w-3xl">
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-[#16264D]">
              Not just eligible.
              <br />
              Ranked.
            </h2>
            <p className="mt-4 max-w-lg text-brand-500">
              We evaluate lender-specific rules and rank the lenders that best fit the borrower.
            </p>
          </div>
          <MatchScore rates={rates} />
        </Reveal>
      </section>

      {/* Before / after */}
      <section className="border-t border-brand-100 bg-cream-50 px-6 py-24 sm:px-10 lg:pl-48 lg:pr-48">
        <Reveal className="flex w-full flex-col gap-12">
          <h2 className="text-left text-4xl font-extrabold tracking-tight sm:text-5xl text-[#16264D]">Guessing vs. matching.</h2>
          <BeforeAfter />
        </Reveal>
      </section>

      {/* Metrics */}
      <section className="px-6 py-24 sm:px-10 lg:pl-48 lg:pr-48">
        <Reveal className="flex w-full">
          <Metrics metrics={metrics} />
        </Reveal>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-[#16264D] px-6 py-32 text-center sm:px-10 lg:pl-48 lg:pr-48 mt-24">
        {/* Glow Effects */}
        <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-color-dodge" style={{ backgroundImage: "url('/noise.png')", backgroundSize: "150px 150px" }}></div>
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ background: "radial-gradient(circle at 50% 100%, rgba(245,130,32,0.15) 0%, transparent 60%)" }}
        />
        <div className="relative flex w-full flex-col items-center gap-8 z-10">
          <div className="flex flex-col gap-4 max-w-3xl">
            <h2 className="text-5xl font-black leading-tight tracking-tighter sm:text-7xl text-white">
              Stop guessing.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#8B9DBB]">Start matching.</span>
            </h2>
            <p className="text-xl font-medium text-[#8B9DBB] max-w-xl mx-auto mt-2">
              Bypass the manual paperwork and let our engine instantly identify the exact lenders whose underwriting rules fit your profile.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <Link
              href="/explore"
              className="group inline-flex items-center gap-2 rounded-full bg-[#F58220] px-10 py-5 text-lg font-extrabold text-white shadow-[0_0_40px_rgba(245,130,32,0.4)] transition-all hover:scale-[1.03] hover:shadow-[0_0_60px_rgba(245,130,32,0.6)]"
            >
              Check your eligibility <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-[#334971] bg-[#223760]/50 px-10 py-5 text-lg font-bold text-white transition-colors hover:bg-[#334971]/50 hover:border-[#8B9DBB]"
            >
              Explore the engine
            </a>
          </div>
        </div>
      </section>

      {/* Pinned to the bottom of the viewport at all times, matching where
          the Explore tool's own ticker sits — not just the last thing in
          the page's scroll, an always-visible footer bar. */}
      <div className="fixed inset-x-0 bottom-0 z-40">
        <VerifiedRatesTicker rates={tickerRates} />
      </div>
    </div>
  );
}
