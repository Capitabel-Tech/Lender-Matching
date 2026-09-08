// Purely illustrative controls — not wired to anything. Landing pages sell
// the idea with a preview, they don't hand over a working instance of the
// tool (that's what "Explore Lenders" is for) — same call made earlier for
// the hero's own preview.
function ToggleMock({ label, on }: { label: string; on: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-brand-100 bg-white px-4 py-3 shadow-sm">
      <span className="text-sm text-[#16264D]">{label}</span>
      <span
        className={`flex h-5 w-9 items-center rounded-full px-0.5 ${on ? "justify-end bg-[#F58220]" : "justify-start bg-brand-100"}`}
      >
        <span className="h-4 w-4 rounded-full bg-[#0F1A33]" />
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
      <div className="flex flex-col gap-3 rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
        <ToggleMock label="Employment: Salaried" on />
        <ToggleMock label="Property: Self-Occupied" on={false} />
        <div className="flex flex-col gap-2 rounded-lg border border-brand-100 bg-cream-50 px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#16264D]">Loan amount</span>
            <span className="font-semibold text-[#16264D]">₹ 50,00,000</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-brand-100">
            <div className="h-1.5 w-2/5 rounded-full bg-[#F58220]" />
          </div>
        </div>
        <p className="mt-2 text-sm text-brand-500">
          <span className="font-bold text-[#16264D]">{bankCount} lenders</span> match this profile.{" "}
          <span className="text-brand-500">Complete your profile in Explore Mode to see exact matches.</span>
        </p>
      </div>

      <div
        className="flex flex-col gap-3 rounded-2xl border border-success-500/30 bg-white p-5 shadow-sm"
        style={{ boxShadow: "0 0 30px rgba(31,138,91,0.1)" }}
      >
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-success-50 px-2 py-0.5 text-[10px] font-bold text-success-700">
            Match result card
          </span>
          <span className="text-[9px] text-brand-500">Illustrative</span>
        </div>
        <p className="text-lg font-bold text-[#16264D]">{sampleBankName ?? "Sample Bank"} — Ranked #1</p>
        <ul className="flex flex-col gap-1.5 text-xs text-brand-500">
          <li>• Lowest live rate{sampleRatePct !== null ? `: ${sampleRatePct.toFixed(2)}%` : ""}</li>
          <li>• Max loan estimated from your FOIR</li>
          <li>• High approval tier</li>
        </ul>
      </div>
    </div>
  );
}
