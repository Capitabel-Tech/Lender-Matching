function CalculatorIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5h16l-6 8v5l-4 2v-7L4 5Z" />
    </svg>
  );
}

function PodiumIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 21V13h4v8M10 21V9h4v12M16 21v-6h4v6" />
    </svg>
  );
}

const CARDS = [
  {
    Icon: CalculatorIcon,
    step: "1",
    title: "Data Intake & Precise Affordability",
    body: "Income, obligations, and requested loan amount feed straight into the FOIR formula — no generic income multiplier.",
    demo: [
      { label: "Monthly income", value: "₹80,000" },
      { label: "FOIR limit", value: "58%" },
    ],
  },
  {
    Icon: FilterIcon,
    step: "2",
    title: "Eligibility & FOIR Filtering",
    body: "Every lender's real rules — employment type, property type, FOIR ceiling — checked against your profile before anything is ranked.",
    demo: [
      { label: "Bank Of India", ok: true },
      { label: "Kotak Mahindra Bank", ok: false },
    ],
  },
  {
    Icon: PodiumIcon,
    step: "3",
    title: "Ranking & Bias Priority",
    body: "Eligible lenders are ordered by rate — and where a real relationship exists, that context is surfaced too, not hidden.",
    demo: [{ label: "Canara Bank", tag: "Pinned Relationship" }],
  },
] as const;

export function FeatureCards() {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {CARDS.map((card) => (
        <div
          key={card.title}
          className="flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00D6C9]/10 text-[#18E0FF]">
              <card.Icon />
            </span>
            <span className="font-mono text-xs text-[#91A0AE]">STEP {card.step}</span>
          </div>
          <h3 className="text-base font-bold text-[#F5F7FA]">{card.title}</h3>
          <p className="text-sm text-[#91A0AE]">{card.body}</p>

          <div className="mt-auto flex flex-col gap-2 border-t border-white/[0.06] pt-4">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#91A0AE]">Sample</p>
            {"value" in (card.demo[0] ?? {}) &&
              (card.demo as readonly { label: string; value: string }[]).map((d) => (
                <div key={d.label} className="flex items-center justify-between text-xs">
                  <span className="text-[#91A0AE]">{d.label}</span>
                  <span className="font-semibold text-[#F5F7FA]">{d.value}</span>
                </div>
              ))}
            {"ok" in (card.demo[0] ?? {}) &&
              (card.demo as readonly { label: string; ok: boolean }[]).map((d) => (
                <div key={d.label} className="flex items-center justify-between text-xs">
                  <span className="text-[#91A0AE]">{d.label}</span>
                  <span className={d.ok ? "text-[#7CFF8A]" : "text-[#91A0AE]"}>{d.ok ? "✓ Eligible" : "✕ Rejected"}</span>
                </div>
              ))}
            {"tag" in (card.demo[0] ?? {}) &&
              (card.demo as readonly { label: string; tag: string }[]).map((d) => (
                <div key={d.label} className="flex items-center justify-between text-xs">
                  <span className="text-[#F5F7FA]">{d.label}</span>
                  <span className="rounded-full bg-[#00D6C9]/10 px-2 py-0.5 text-[10px] font-semibold text-[#18E0FF]">
                    {d.tag}
                  </span>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
