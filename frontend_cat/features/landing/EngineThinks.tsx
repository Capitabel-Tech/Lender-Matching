const INPUT_FIELDS = [
  { label: "Income", value: "₹80,000" },
  { label: "Loan", value: "₹50L" },
  { label: "Tenure", value: "20Y" },
  { label: "Property", value: "Residential" },
  { label: "Employment", value: "Salaried" },
];

const RULES = ["FOIR", "Age", "Income", "Property", "Location", "Tenure"];

function Column({ title, tag, children }: { title: string; tag?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#91A0AE]">{title}</p>
        {tag && (
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-[#91A0AE]">
            {tag}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

export function EngineThinks({ sampleLenders }: { sampleLenders: string[] }) {
  const matches = sampleLenders.slice(0, 4).map((name, i) => ({ name, eligible: i !== 3 }));

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-start">
      <Column title="Input" tag="Demo data">
        {INPUT_FIELDS.map((f) => (
          <div
            key={f.label}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm"
          >
            <span className="text-[#91A0AE]">{f.label}</span>
            <span className="font-semibold text-[#F5F7FA]">{f.value}</span>
          </div>
        ))}
      </Column>

      <div className="hidden items-center justify-center lg:flex">
        <span className="text-2xl text-[#00D6C9]">→</span>
      </div>

      <Column title="Rule engine">
        {RULES.map((r) => (
          <div
            key={r}
            className="rounded-lg border border-[#00D6C9]/25 bg-[#00D6C9]/[0.06] px-3 py-2 text-sm font-medium text-[#18E0FF]"
          >
            {r}
          </div>
        ))}
      </Column>

      <div className="hidden items-center justify-center lg:flex">
        <span className="text-2xl text-[#00D6C9]">→</span>
      </div>

      <Column title="Match" tag="Illustrative">
        {matches.map((m) => (
          <div
            key={m.name}
            className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm font-semibold ${
              m.eligible ? "border-[#7CFF8A]/30 bg-[#7CFF8A]/[0.06] text-[#7CFF8A]" : "border-white/10 text-[#91A0AE]"
            }`}
          >
            {m.name}
            <span>{m.eligible ? "✓" : "×"}</span>
          </div>
        ))}
      </Column>
    </div>
  );
}
