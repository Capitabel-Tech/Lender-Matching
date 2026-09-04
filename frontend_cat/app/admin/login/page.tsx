"use client";

import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { EngineCore } from "@/features/landing/EngineFlow";
import { EMPTY_FILTERS, exploreBanks, fetchCategories, fetchLiveRates } from "@/lib/api/explore";
import { useAuth } from "@/lib/useAuth";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "600"] });

// Same company domain app/auth.py's require_login enforces for brand new
// accounts — shown here only so the button is honest about what happens
// next, not re-checked client-side (the backend is the real gate).
const COMPANY_DOMAIN = "capitabel.com";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.88-3.01c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.11A12 12 0 0 0 12 24Z"
      />
      <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.26A12 12 0 0 0 0 12c0 1.94.46 3.77 1.26 5.39l4.01-3.11Z" />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.94 1.19 15.23 0 12 0A12 12 0 0 0 1.26 6.61l4.01 3.11C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

interface Stats {
  bankCount: number;
  productCount: number;
  categoryValueCount: number;
  liveRateCount: number;
}

function InfoPanel({ stats }: { stats: Stats | null }) {
  const metrics = [
    { value: stats ? String(stats.bankCount) : "—", label: "Lenders Loaded" },
    { value: stats ? String(stats.productCount) : "—", label: "Loan Products" },
    { value: stats ? `${stats.categoryValueCount}+` : "—", label: "Eligibility Values" },
    { value: stats ? String(stats.liveRateCount) : "—", label: "Live Rates Tracked" },
  ];

  return (
    <div className="hidden max-w-lg flex-col gap-10 lg:flex">
      <div className="flex flex-col gap-5">
        <p className={`${mono.className} text-xs font-semibold uppercase tracking-[0.25em] text-[#18E0FF]`}>
          Lender Match Engine · Admin Console
        </p>
        <h1 className="text-[44px] font-bold leading-[1.05] tracking-tight xl:text-[56px]">
          Every lender&rsquo;s rules.
          <br />
          <span className="text-[#00D6C9]">One dashboard.</span>
        </h1>
        <p className="max-w-md text-base leading-relaxed text-[#91A0AE]">
          This is where banks, eligibility rules, relationship priority, and category data actually get managed —
          every change here shows up for real borrowers on the live site immediately.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-8 border-t border-white/[0.08] pt-8">
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col gap-1">
            <p className="text-4xl font-bold tracking-tight text-[#F5F7FA] xl:text-5xl">{m.value}</p>
            <p className={`${mono.className} text-[10px] font-semibold uppercase tracking-[0.15em] text-[#91A0AE]`}>
              {m.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  const { loginWithGoogle, error } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [banksRes, categories, rates] = await Promise.all([
          exploreBanks(EMPTY_FILTERS),
          fetchCategories(),
          fetchLiveRates(),
        ]);
        if (cancelled) return;
        const bankCount = new Set(banksRes.results.map((p) => p.bank_name)).size;
        const categoryValueCount = Object.entries(categories).reduce(
          (sum, [key, value]) => (key === "property_type_groups" ? sum : sum + (value as unknown[]).length),
          0,
        );
        setStats({
          bankCount,
          productCount: banksRes.total,
          categoryValueCount,
          liveRateCount: rates.length,
        });
      } catch {
        // Stats are a nice-to-have here, not load-bearing — login still
        // works fine if the public explore endpoints are unreachable.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleGoogleLogin() {
    setSubmitting(true);
    await loginWithGoogle();
    setSubmitting(false);
    // /admin itself checks the role and redirects to /admin/pending if this
    // account hasn't been approved yet — no need to duplicate that check here.
    router.push("/admin");
  }

  return (
    <div className={`${spaceGrotesk.className} relative flex flex-1 flex-col overflow-hidden bg-[#050B12] px-6 py-16 text-[#F5F7FA] sm:px-10`}>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(circle at 30% 20%, rgba(0,214,201,0.14) 0%, transparent 55%)" }}
      />

      <Link href="/explore" className="relative mb-10 text-sm font-medium text-[#91A0AE] hover:text-[#F5F7FA]">
        ← Back to the lender finder
      </Link>

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 items-center justify-center gap-20">
        <InfoPanel stats={stats} />

        <div className="flex w-full max-w-lg shrink-0 flex-col items-center gap-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-8 pb-9 pt-10 shadow-2xl backdrop-blur-md sm:px-12">
          <div className="relative h-[110px] w-[110px] shrink-0">
            <EngineCore />
          </div>

          <div className="flex flex-col items-center gap-3 text-center">
            <p className={`${mono.className} text-[11px] font-semibold uppercase tracking-[0.2em] text-[#18E0FF]`}>
              Restricted Access
            </p>
            <h2 className="text-[32px] font-bold leading-[1.1] tracking-tight sm:text-[38px]">
              Admin <span className="text-[#00D6C9]">Login</span>
            </h2>
            <p className="max-w-xs text-sm leading-relaxed text-[#91A0AE]">
              New here? Signing in also creates your access request —{" "}
              <span className="font-semibold text-[#F5F7FA]">a super admin just needs to approve it</span> before you
              can get in.
            </p>
          </div>

          {error && (
            <p className="w-full rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-center text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2.5 rounded-lg bg-white px-5 py-3.5 text-sm font-semibold text-zinc-800 shadow-[0_0_28px_rgba(0,214,201,0.25)] transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            <GoogleIcon />
            {submitting ? "Signing in…" : `Continue with your @${COMPANY_DOMAIN} email`}
          </button>

          <p className={`${mono.className} text-[10px] uppercase tracking-[0.15em] text-[#91A0AE]/70`}>
            Lender<span className="text-[#00D6C9]">Match</span> · Admin Panel
          </p>
        </div>
      </div>
    </div>
  );
}
