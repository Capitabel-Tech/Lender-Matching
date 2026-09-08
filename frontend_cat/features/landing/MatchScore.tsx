import type { LiveRate } from "@/lib/api/explore";

// Real ranking by real published rate — not a fabricated "match score".
// The lowest rate isn't necessarily who a given borrower is actually
// eligible for; this is a ranking demonstration, not a personal result.
export function MatchScore({ rates }: { rates: LiveRate[] }) {
  const top = rates.slice(0, 5);
  if (top.length === 0) return null;
  const minRate = top[0].rate_pct;
  const maxRate = top[top.length - 1].rate_pct;
  const spread = maxRate - minRate || 1;

  return (
    <div className="flex flex-col gap-3">
      {top.map((r, i) => {
        const widthPct = 100 - ((r.rate_pct - minRate) / spread) * 35;
        const isTop = i === 0;
        return (
          <div key={r.bank_name} className="flex items-center gap-4">
            <span className="w-6 shrink-0 font-mono text-sm text-[#A9B4C9]">{String(i + 1).padStart(2, "0")}</span>
            <div className="flex-1">
              <div
                className={`flex min-w-0 items-center justify-between gap-3 rounded-lg px-4 py-3 ${isTop ? "border border-[#34D399]/40" : "border border-white/10"}`}
                style={{
                  width: `${widthPct}%`,
                  background: isTop
                    ? "linear-gradient(90deg, rgba(52,211,153,0.14), rgba(52,211,153,0.03))"
                    : "rgba(255,255,255,0.03)",
                  boxShadow: isTop ? "0 0 30px rgba(52,211,153,0.15)" : undefined,
                }}
              >
                <span
                  title={r.bank_name}
                  className={`min-w-0 truncate text-sm font-semibold ${isTop ? "text-[#34D399]" : "text-[#FFFFFF]"}`}
                >
                  {r.bank_name}
                </span>
                <span className={`shrink-0 text-sm font-bold ${isTop ? "text-[#34D399]" : "text-[#F7A755]"}`}>
                  {r.rate_pct.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
      <p className="mt-2 text-xs text-[#A9B4C9]">Ranked by published interest rate — not a personalized result.</p>
    </div>
  );
}
