function ProfileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}

function RuleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

function BankIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 4l9 6.5" />
      <path d="M5 10v9M10 10v9M14 10v9M19 10v9" />
      <path d="M3 19h18" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5h16l-6 8v5l-4 2v-7L4 5Z" />
    </svg>
  );
}

function OptionsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 2 2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8-5.1-4.7 6.9-.8L12 2Z" />
    </svg>
  );
}

const STAGES = [
  { Icon: ProfileIcon, label: "Borrower Profile" },
  { Icon: RuleIcon, label: "Rule Engine" },
  { Icon: BankIcon, label: "Lender Policies" },
  // "Eligibility Filter", not "Match Score" — the live tool doesn't compute
  // or show a numeric score, it filters to lenders whose rules the borrower
  // actually meets (see features/explore/ResultsList.tsx: results are
  // grouped by employment type, not ranked by fit).
  { Icon: FilterIcon, label: "Eligibility Filter" },
  { Icon: OptionsIcon, label: "Best Options" },
] as const;

// A horizontal data pipeline — each segment carries a glowing dot that
// loops along it, staggered so the flow reads left-to-right. Nodes and
// connectors are direct siblings in one flex row (not a connector nested
// inside a node's own column) so the connector's flex-1 actually spans
// the gap between two nodes instead of just sitting under one of them.
export function Pipeline() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center">
      {STAGES.map(({ Icon, label }, i) => (
        <div key={label} className="contents">
          <div className="flex items-center gap-4 sm:flex-col sm:items-center sm:gap-3 sm:text-center">
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[#050B12] motion-safe:[animation:engine-pulse_5s_ease-in-out_infinite]"
              style={{
                background: "radial-gradient(circle at 35% 30%, #18E0FF 0%, #00D6C9 65%, #08141D 130%)",
                boxShadow: "0 0 28px rgba(0,214,201,0.45)",
                animationDelay: `${i * 0.3}s`,
              }}
            >
              <Icon />
            </span>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#F5F7FA] sm:text-[13px]">{label}</p>
          </div>

          {i < STAGES.length - 1 && (
            <>
              {/* Mobile: short vertical connector below the node */}
              <div className="relative ml-7 h-8 w-px bg-gradient-to-b from-[#00D6C9]/60 to-transparent sm:hidden" />
              {/* Desktop: horizontal connector between nodes */}
              <div className="relative hidden h-0.5 flex-1 self-center bg-gradient-to-r from-[#00D6C9]/50 via-white/10 to-[#00D6C9]/50 sm:mx-3 sm:block">
                <span
                  className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#18E0FF] shadow-[0_0_10px_rgba(24,224,255,1)] motion-safe:animate-[pipeline-flow_2.4s_linear_infinite]"
                  style={{ animationDelay: `${i * 0.4}s` }}
                />
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
