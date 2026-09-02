import { Space_Grotesk } from "next/font/google";
import Link from "next/link";

import { BeforeAfter } from "@/features/landing/BeforeAfter";
import { EngineThinks } from "@/features/landing/EngineThinks";
import { EngineVisual } from "@/features/landing/EngineVisual";
import { LendersNetwork } from "@/features/landing/LendersNetwork";
import { MatchScore } from "@/features/landing/MatchScore";
import { Metrics } from "@/features/landing/Metrics";
import { Pipeline } from "@/features/landing/Pipeline";
import { Reveal } from "@/features/landing/Reveal";
import { EMPTY_FILTERS, FILTER_CATEGORIES, exploreBanks, fetchCategories, fetchLiveRates } from "@/lib/api/explore";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

// All the real data below (rates, bank names, category counts) reads
// current data at request time — without this, Next.js would pre-render
// this Server Component once at build time and every number would
// silently go stale between deploys.
export const dynamic = "force-dynamic";

const NAV_LINKS = [
  { label: "Product", href: "/explore" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Lenders", href: "#lenders" },
  { label: "About", href: "#" },
] as const;

export default async function Landing() {
  const [rates, banksRes, categories] = await Promise.all([
    fetchLiveRates().catch(() => []),
    exploreBanks(EMPTY_FILTERS).catch(() => null),
    fetchCategories().catch(() => null),
  ]);

  const bankNames = banksRes ? [...new Set(banksRes.results.map((p) => p.bank_name))] : rates.map((r) => r.bank_name);
  const bankCount = bankNames.length;
  const categoryValueCount = categories
    ? Object.entries(categories).reduce((sum, [key, value]) => (key === "property_type_groups" ? sum : sum + (value as unknown[]).length), 0)
    : 0;
  const topMatchName = rates[0]?.bank_name ?? null;
  const engineNodeNames = bankNames.slice(0, 14);
  const networkNodeNames = bankNames.slice(0, 20);

  const metrics = [
    { value: String(bankCount), label: "Lenders" },
    { value: `${categoryValueCount}+`, label: "Eligibility Values" },
    { value: String(FILTER_CATEGORIES.length), label: "Match Criteria" },
    { value: "Seconds", label: "To Match" },
  ];

  return (
    <div className={`${spaceGrotesk.className} flex flex-1 flex-col bg-[#050B12] text-[#F5F7FA]`}>
      {/* Header — minimal, floating, transparent + blur */}
      <header className="sticky top-0 z-50 flex shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#050B12]/70 px-6 py-4 backdrop-blur-md sm:px-10">
        <span className="text-base font-bold tracking-tight">
          Lender<span className="text-[#00D6C9]">Match</span>
        </span>
        <nav className="hidden items-center gap-8 text-sm text-[#91A0AE] md:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="transition-colors hover:text-[#F5F7FA]">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/admin/login" className="hidden text-sm text-[#91A0AE] hover:text-[#F5F7FA] sm:inline-block">
            Sign in
          </Link>
          <Link
            href="/explore"
            className="group inline-flex items-center gap-1.5 rounded-full bg-[#00D6C9] px-4 py-2 text-sm font-semibold text-[#050B12] shadow-[0_0_20px_rgba(0,214,201,0.35)] transition-transform hover:scale-[1.03]"
          >
            Check eligibility <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-24 pt-16 sm:px-10 sm:pt-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
          <div className="flex flex-col gap-7">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#00D6C9]">
              Rule-Based Lender Matching Engine
            </p>
            <h1 className="text-[48px] font-bold leading-[1.05] tracking-tight sm:text-[64px] lg:text-[76px]">
              One profile.
              <br />
              Every lender.
              <br />
              <span className="text-[#00D6C9]">Your best matches.</span>
            </h1>
            <p className="max-w-md text-lg text-[#91A0AE] sm:text-xl">
              Turn borrower information into lender matches using eligibility rules, FOIR, property criteria and
              loan policies.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/explore"
                className="group inline-flex items-center gap-2 rounded-full bg-[#00D6C9] px-7 py-3.5 text-base font-semibold text-[#050B12] shadow-[0_0_30px_rgba(0,214,201,0.35)] transition-transform hover:scale-[1.03]"
              >
                Check your eligibility <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-base font-semibold text-[#F5F7FA] transition-colors hover:border-white/30"
              >
                Explore how it works
              </a>
            </div>
            <p className="text-xs uppercase tracking-wide text-[#91A0AE]">
              No hard credit inquiry &nbsp;•&nbsp; Rule-based matching &nbsp;•&nbsp; Results in seconds
            </p>
          </div>

          <EngineVisual lenderNames={engineNodeNames} topMatchName={topMatchName} bankCount={bankCount} />
        </div>
      </section>

      {/* Engine pipeline */}
      <section className="border-t border-white/[0.06] bg-[#08141D] px-6 py-20 sm:px-10">
        <Reveal className="mx-auto flex max-w-5xl flex-col gap-12">
          <h2 className="text-center text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            One borrower. Hundreds of rules.
            <br />
            One intelligent match.
          </h2>
          <Pipeline />
        </Reveal>
      </section>

      {/* How the engine thinks */}
      <section id="how-it-works" className="px-6 py-24 sm:px-10">
        <Reveal className="mx-auto flex max-w-6xl flex-col gap-14">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">How the engine thinks</h2>
          <EngineThinks sampleLenders={bankNames} />
        </Reveal>
      </section>

      {/* One engine, every lender's rules */}
      <section id="lenders" className="border-t border-white/[0.06] bg-[#08141D] px-6 py-24 sm:px-10">
        <Reveal className="mx-auto flex max-w-6xl flex-col items-center gap-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
            One engine.
            <br />
            Every lender&rsquo;s rules.
          </h2>
          <LendersNetwork names={networkNodeNames} />
        </Reveal>
      </section>

      {/* Match score */}
      <section className="px-6 py-24 sm:px-10">
        <Reveal className="mx-auto flex max-w-3xl flex-col gap-10">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Not just eligible.
              <br />
              Ranked.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[#91A0AE]">
              We evaluate lender-specific rules and rank the lenders that best fit the borrower.
            </p>
          </div>
          <MatchScore rates={rates} />
        </Reveal>
      </section>

      {/* Before / after */}
      <section className="border-t border-white/[0.06] bg-[#08141D] px-6 py-24 sm:px-10">
        <Reveal className="mx-auto flex max-w-4xl flex-col gap-12">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-5xl">
            Guessing vs. matching.
          </h2>
          <BeforeAfter />
        </Reveal>
      </section>

      {/* Metrics */}
      <section className="px-6 py-24 sm:px-10">
        <Reveal className="mx-auto max-w-5xl">
          <Metrics metrics={metrics} />
        </Reveal>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden border-t border-white/[0.06] bg-[#08141D] px-6 py-28 text-center sm:px-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{ background: "radial-gradient(circle at 50% 40%, rgba(0,214,201,0.12) 0%, transparent 60%)" }}
        />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
          <h2 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Stop guessing.
            <br />
            Start matching.
          </h2>
          <p className="text-lg text-[#91A0AE]">Find lenders whose rules actually fit your profile.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/explore"
              className="group inline-flex items-center gap-2 rounded-full bg-[#00D6C9] px-8 py-4 text-lg font-semibold text-[#050B12] shadow-[0_0_30px_rgba(0,214,201,0.35)] transition-transform hover:scale-[1.03]"
            >
              Check your eligibility <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-8 py-4 text-lg font-semibold hover:border-white/30"
            >
              Explore the engine
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
