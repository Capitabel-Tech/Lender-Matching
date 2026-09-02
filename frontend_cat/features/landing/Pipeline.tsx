// "Eligibility Filter", not "Match Score" — the live tool doesn't compute
// or show a numeric score, it filters to lenders whose rules the borrower
// actually meets (see features/explore/ResultsList.tsx: results are
// grouped by employment type, not ranked by fit).
const STAGES = ["Borrower Profile", "Rule Engine", "Lender Policies", "Eligibility Filter", "Best Options"];

// A horizontal data pipeline — each segment carries a small glowing dot
// that loops along it, staggered so the flow reads left-to-right.
export function Pipeline() {
  return (
    <div className="flex items-center justify-between gap-0">
      {STAGES.map((stage, i) => (
        <div key={stage} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="h-2 w-2 rounded-full bg-[#00D6C9] shadow-[0_0_10px_rgba(0,214,201,0.8)]" />
            <p className="max-w-[7rem] text-[11px] font-medium uppercase tracking-wide text-[#91A0AE] sm:max-w-none sm:text-xs">
              {stage}
            </p>
          </div>
          {i < STAGES.length - 1 && (
            <div className="relative mx-2 h-px flex-1 bg-white/10 sm:mx-4">
              <span
                className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#18E0FF] shadow-[0_0_8px_rgba(24,224,255,0.9)] motion-safe:animate-[pipeline-flow_2.4s_linear_infinite]"
                style={{ animationDelay: `${i * 0.4}s` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
