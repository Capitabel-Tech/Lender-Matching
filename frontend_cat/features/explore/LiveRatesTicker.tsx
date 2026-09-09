"use client";

import { useEffect, useState } from "react";

import { errorMessage } from "@/lib/api/client";
import { fetchLiveRates, type LiveRate } from "@/lib/api/explore";
import { BankLogo } from "@/lib/bankLogos";

// Scrolling footer bar showing every bank rate that's actually been
// confirmed against Ambak (see the live-rates endpoint) — never the
// "Interest rate not verified" banks, since this is meant to read as real,
// current data, not a placeholder. Refetches periodically so it reflects
// whatever the daily Ambak scrape currently has, without needing a reload.
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

function RateChip({ rate }: { rate: LiveRate }) {
  return (
    <span className="mx-3 inline-flex shrink-0 items-center gap-2 rounded-full bg-[#223760]/80 py-1.5 pl-1.5 pr-4 text-sm font-semibold text-white border border-[#334971]">
      <BankLogo bankName={rate.bank_name} size={22} />
      {rate.bank_name}
      <span className="font-black text-[#F58220] ml-1">{rate.rate_pct.toFixed(2)}%</span>
    </span>
  );
}

export function LiveRatesTicker() {
  const [rates, setRates] = useState<LiveRate[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    function load() {
      fetchLiveRates()
        .then((data) => {
          if (!cancelled) {
            setRates(data);
            setError(null);
          }
        })
        .catch((err) => {
          if (!cancelled) setError(errorMessage(err));
        });
    }

    load();
    const interval = setInterval(load, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Nothing confirmed yet (still loading, request failed, or every bank is
  // currently unverified) — no ticker rather than an empty/broken-looking bar.
  if (!rates || rates.length === 0 || error) return null;

  return (
    <div className="flex shrink-0 items-center gap-3 overflow-hidden border-t-2 border-[#16264D] bg-[#16264D] py-3 relative z-20">
      <div className="flex shrink-0 items-center gap-2 pl-6 pr-4 border-r border-[#223760]">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#EF4444] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
        </span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Live rates</span>
      </div>
      <div className="group relative flex-1 overflow-hidden">
        <div
          className="flex w-max items-center [animation:ticker-scroll_50s_linear_infinite] group-hover:[animation-play-state:paused]"
          style={{ animationDuration: `${Math.max(rates.length * 3, 25)}s` }}
        >
          {/* Rendered twice back-to-back so the -50% loop point is seamless. */}
          {[...rates, ...rates].map((rate, i) => (
            <RateChip key={`${rate.bank_name}-${i}`} rate={rate} />
          ))}
        </div>
      </div>
    </div>
  );
}
