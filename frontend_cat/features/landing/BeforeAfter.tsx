const WITHOUT = ["Apply", "Wait", "Reject", "Apply again", "Repeat"];
const WITH = ["Profile", "Evaluate", "Match", "Compare", "Apply"];

function Flow({ steps, tone }: { steps: string[]; tone: "muted" | "bright" }) {
  return (
    <div className="flex flex-col gap-3">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-3">
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              tone === "bright" ? "bg-[#00D6C9] text-[#050B12]" : "bg-white/10 text-[#91A0AE]"
            }`}
          >
            {i + 1}
          </span>
          <span className={`text-sm font-medium ${tone === "bright" ? "text-[#F5F7FA]" : "text-[#91A0AE]"}`}>{step}</span>
        </div>
      ))}
    </div>
  );
}

export function BeforeAfter() {
  return (
    <div className="grid gap-10 sm:grid-cols-2">
      <div className="flex flex-col gap-5 rounded-2xl border border-white/10 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#91A0AE]">Without LenderMatch</p>
        <Flow steps={WITHOUT} tone="muted" />
      </div>
      <div className="flex flex-col gap-5 rounded-2xl border border-[#00D6C9]/30 bg-[#00D6C9]/[0.04] p-6">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#18E0FF]">With LenderMatch</p>
        <Flow steps={WITH} tone="bright" />
      </div>
    </div>
  );
}
