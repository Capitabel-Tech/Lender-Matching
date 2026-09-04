import { BankLogo } from "@/lib/bankLogos";

export interface TickerRate {
  bankName: string;
  ratePct: number;
  isEstimated: boolean;
}

// A compact single-line ticker distinct from the tool's own LiveRatesTicker
// (features/explore/LiveRatesTicker.tsx) in one real way: that one only
// ever shows confirmed rates (estimated ones are deliberately left out, see
// its own docstring). This one shows both, tagged honestly, since the point
// here is proving the system tracks rate confidence at all — hiding the
// estimated ones would undersell that.
export function VerifiedRatesTicker({ rates }: { rates: TickerRate[] }) {
  if (rates.length === 0) return null;
  const doubled = [...rates, ...rates];

  return (
    <div className="flex shrink-0 items-center gap-3 overflow-hidden border-b border-white/[0.06] bg-[#08141D] py-2">
      <div className="flex shrink-0 items-center gap-1.5 pl-6 pr-3 sm:pl-10">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00D6C9] opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00D6C9]" />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#00D6C9]">Live rates</span>
      </div>
      <div className="group relative flex-1 overflow-hidden">
        <div
          className="flex w-max items-center motion-safe:[animation:ticker-scroll_45s_linear_infinite] motion-safe:group-hover:[animation-play-state:paused]"
          style={{ animationDuration: `${Math.max(rates.length * 3, 20)}s` }}
        >
          {doubled.map((r, i) => (
            <span key={`${r.bankName}-${i}`} className="mx-3 inline-flex shrink-0 items-center gap-1.5 text-xs">
              <BankLogo bankName={r.bankName} size={18} />
              <span className="font-semibold text-[#F5F7FA]">{r.bankName}</span>
              <span className="font-bold text-[#00D6C9]">{r.ratePct.toFixed(2)}%</span>
              <span className={r.isEstimated ? "text-[#91A0AE]" : "text-[#7CFF8A]"}>
                ({r.isEstimated ? "Estimated" : "Verified"})
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
