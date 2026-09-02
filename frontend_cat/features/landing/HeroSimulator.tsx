"use client";

import { Fraunces } from "next/font/google";
import { useEffect, useMemo, useState } from "react";

import { EMPTY_FILTERS, exploreBanks, type LiveRate } from "@/lib/api/explore";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["600"] });

const TENURE_OPTIONS = [5, 10, 15, 20, 25, 30] as const;
const MIN_LOAN = 500_000;
const MAX_LOAN = 20_000_000;

// A handful of distinct colors to tell the icon squares apart, since we
// have no real bank logos to show — cycled by position, not tied to any
// specific bank.
const ICON_COLORS = ["bg-rose-600", "bg-teal-600", "bg-indigo-600", "bg-amber-600"];

// Standard reducing-balance EMI formula — the same shape as
// backend_cat/app/domain.py's calculate_max_emi, run in reverse (given a
// loan amount, what's the EMI, instead of given an EMI ceiling, what's the
// max loan). Kept client-side since it only needs numbers already on
// screen (the slider + tenure), not a network round trip.
function computeEmi(principal: number, annualRatePct: number, years: number): number {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  const factor = Math.pow(1 + r, n);
  return (principal * r * factor) / (factor - 1);
}

function rupees(n: number): string {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

interface BankRow {
  bankName: string;
  ratePct: number;
  maxEmi: number | null; // FOIR-based ceiling — only known once income is entered
}

function BankIcon({ name, index }: { name: string; index: number }) {
  // A stand-in for a real bank logo (which we don't have).
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white ${ICON_COLORS[index % ICON_COLORS.length]}`}
    >
      {name.charAt(0)}
    </span>
  );
}

export function HeroSimulator({ initialRates }: { initialRates: LiveRate[] }) {
  const [incomeInput, setIncomeInput] = useState("");
  const [loanAmount, setLoanAmount] = useState(5_000_000);
  const [tenureYears, setTenureYears] = useState(20);
  const [foirRows, setFoirRows] = useState<Map<string, BankRow> | null>(null);
  const [checking, setChecking] = useState(false);

  const monthlyIncome = Number(incomeInput.replace(/[^\d]/g, ""));
  const hasIncome = incomeInput.trim() !== "" && monthlyIncome > 0;

  // Only the rate list depends on the network — the slider and tenure are
  // pure client-side math on top of it, so dragging them never refetches.
  useEffect(() => {
    if (!hasIncome) {
      setFoirRows(null);
      return;
    }
    let cancelled = false;
    setChecking(true);
    const timer = setTimeout(() => {
      exploreBanks({ ...EMPTY_FILTERS, monthly_income: monthlyIncome })
        .then((res) => {
          if (cancelled) return;
          const byBank = new Map<string, BankRow>();
          for (const p of res.results) {
            const existing = byBank.get(p.bank_name);
            // A bank can appear once per employment type — keep whichever
            // gives the best (lowest) rate for the preview.
            if (!existing || p.interest_rate_pct < existing.ratePct) {
              byBank.set(p.bank_name, { bankName: p.bank_name, ratePct: p.interest_rate_pct, maxEmi: p.max_emi });
            }
          }
          setFoirRows(byBank);
        })
        .catch(() => {
          if (!cancelled) setFoirRows(null);
        })
        .finally(() => {
          if (!cancelled) setChecking(false);
        });
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [hasIncome, monthlyIncome]);

  const topBanks = useMemo(() => {
    const rows: BankRow[] = foirRows
      ? [...foirRows.values()]
      : initialRates.map((r) => ({ bankName: r.bank_name, ratePct: r.rate_pct, maxEmi: null }));
    return rows.sort((a, b) => a.ratePct - b.ratePct).slice(0, 3);
  }, [foirRows, initialRates]);

  const exploreHref = hasIncome ? `/explore?income=${monthlyIncome}` : "/explore";

  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-800 dark:bg-teal-950/40 dark:text-teal-300">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
          Live rates, checked daily
        </span>
        <h1 className={`${fraunces.className} text-4xl leading-[1.2] text-zinc-900 dark:text-zinc-50 sm:text-[2.75rem]`}>
          Stop applying blind. Match with lenders whose eligibility rules you actually meet.
        </h1>
        <p className="max-w-md text-base text-zinc-500 dark:text-zinc-400">
          We compare FOIR, live rate cards, and your eligibility across {initialRates.length || "every"} lenders
          instantly.
        </p>

        <div className="flex max-w-sm flex-col gap-1.5">
          <label htmlFor="hero-income" className="text-sm text-zinc-600 dark:text-zinc-300">
            Enter Your Monthly Income
          </label>
          <input
            id="hero-income"
            inputMode="numeric"
            value={incomeInput}
            onChange={(e) => setIncomeInput(e.target.value)}
            placeholder="e.g. ₹80,000"
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <a
            href={exploreHref}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-teal-800 px-6 py-3.5 text-base font-semibold text-white hover:bg-teal-900"
          >
            Check My Match (Free & No Credit Impact) →
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-5 rounded-3xl border border-zinc-900/5 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] dark:border-white/5 dark:bg-zinc-900 sm:p-7">
        <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Interactive Simulator Panel</p>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-600 dark:text-zinc-300">Loan Amount</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-50">₹ {loanAmount.toLocaleString("en-IN")}</span>
          </div>
          <input
            type="range"
            min={MIN_LOAN}
            max={MAX_LOAN}
            step={100_000}
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="w-full accent-teal-700"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-zinc-600 dark:text-zinc-300">Tenure</span>
          <select
            value={tenureYears}
            onChange={(e) => setTenureYears(Number(e.target.value))}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-semibold dark:border-zinc-700 dark:bg-zinc-950"
          >
            {TENURE_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y} Years
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Top Matched Lenders {checking && <span className="font-normal text-zinc-400">· checking…</span>}
            </p>
            <a href={exploreHref} className="text-xs font-semibold text-teal-700 hover:underline dark:text-teal-400">
              View Match
            </a>
          </div>
          {topBanks.length === 0 && <p className="text-sm text-zinc-400">Loading live rates…</p>}
          <div className="grid grid-cols-2 gap-2.5">
            {topBanks.map((bank, i) => {
              const emi = computeEmi(loanAmount, bank.ratePct, tenureYears);
              const fits = bank.maxEmi !== null ? emi <= bank.maxEmi : null;
              return (
                <div
                  key={bank.bankName}
                  className={`flex flex-col gap-1.5 rounded-xl border p-3 ${
                    fits === false
                      ? "border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/20"
                      : "border-zinc-100 dark:border-zinc-800"
                  } ${i === topBanks.length - 1 && topBanks.length % 2 === 1 ? "col-span-2" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <BankIcon name={bank.bankName} index={i} />
                    <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{bank.bankName}</p>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {rupees(emi)}/mo
                      {fits !== null && (
                        <span className={fits ? "text-teal-600 dark:text-teal-400" : "text-amber-600 dark:text-amber-400"}>
                          {" "}
                          · {fits ? "fits" : "over FOIR"}
                        </span>
                      )}
                    </p>
                    <span className="text-base font-bold text-teal-700 dark:text-teal-400">
                      {bank.ratePct.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
