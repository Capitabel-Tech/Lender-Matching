// Purely illustrative controls — not wired to anything. Landing pages sell
// the idea with a preview, they don't hand over a working instance of the
// tool (that's what "Explore Lenders" is for) — same call made earlier for
// the hero's own preview.
function ToggleMock({ label, on }: { label: string; on: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3">
      <span className="text-sm text-[#F5F7FA]">{label}</span>
      <span
        className={`flex h-5 w-9 items-center rounded-full px-0.5 ${on ? "justify-end bg-[#00D6C9]" : "justify-start bg-white/10"}`}
      >
        <span className="h-4 w-4 rounded-full bg-[#050B12]" />
      </span>
    </div>
  );
}

export function ExploreModePreview({
  bankCount,
  sampleBankName,
  sampleRatePct,
}: {
  bankCount: number;
  sampleBankName: string | null;
  sampleRatePct: number | null;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <ToggleMock label="Employment: Salaried" on />
        <ToggleMock label="Property: Self-Occupied" on={false} />
        <div className="flex flex-col gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#F5F7FA]">Loan amount</span>
            <span className="font-semibold text-[#F5F7FA]">₹ 50,00,000</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/10">
            <div className="h-1.5 w-2/5 rounded-full bg-[#00D6C9]" />
          </div>
        </div>
        <p className="mt-2 text-sm text-[#91A0AE]">
          <span className="font-bold text-[#F5F7FA]">{bankCount} lenders</span> match this profile.{" "}
          <span className="text-[#91A0AE]">Complete your profile in Explore Mode to see exact matches.</span>
        </p>
      </div>

      <div
        className="flex flex-col gap-3 rounded-2xl border border-[#7CFF8A]/30 bg-[#08141D] p-5"
        style={{ boxShadow: "0 0 30px rgba(124,255,138,0.12)" }}
      >
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-[#7CFF8A]/15 px-2 py-0.5 text-[10px] font-bold text-[#7CFF8A]">
            Match result card
          </span>
          <span className="text-[9px] text-[#91A0AE]">Illustrative</span>
        </div>
        <p className="text-lg font-bold text-[#F5F7FA]">{sampleBankName ?? "Sample Bank"} — Ranked #1</p>
        <ul className="flex flex-col gap-1.5 text-xs text-[#91A0AE]">
          <li>• Lowest live rate{sampleRatePct !== null ? `: ${sampleRatePct.toFixed(2)}%` : ""}</li>
          <li>• Max loan estimated from your FOIR</li>
          <li>• High approval tier</li>
        </ul>
      </div>
    </div>
  );
}
