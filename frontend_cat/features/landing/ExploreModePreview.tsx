import { JetBrains_Mono } from "next/font/google";

const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "700"] });

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
    <div className="relative w-full rounded-3xl bg-[#0F1A33] p-1 shadow-2xl overflow-hidden group">
      {/* A fixed-height glow band, not `-inset-10` on all sides — the card's
          content stacks to a much taller column on mobile (flex-col below
          xl:), and a full-height inset here would blur/tint that entire
          height instead of staying a small corner accent. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 -translate-y-10 bg-gradient-to-r from-[#F58220] via-[#F7A755] to-[#C2590A] opacity-30 blur-3xl transition duration-1000 group-hover:opacity-40"></div>
      
      <div className="relative flex flex-col xl:flex-row gap-6 rounded-[22px] bg-[#101D3D] p-5 md:p-8 z-10 border border-[#223760]">
        
        {/* Left: Compact Input Parameters */}
        <div className="xl:w-[35%] flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2.5 w-2.5 rounded-full bg-[#F58220] animate-pulse"></div>
            <span className={`${mono.className} text-[#F7A755] text-[11px] font-bold uppercase tracking-widest`}>Live Inputs</span>
          </div>

          <div className="bg-[#0b1530] border border-[#223760] rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-[#223760]/50 pb-2">
              <span className="text-[#b8c4d9] text-sm">Employment</span>
              <span className="text-white text-[13px] font-bold bg-[#F58220] px-2 py-0.5 rounded">Salaried</span>
            </div>
            <div className="flex justify-between items-center border-b border-[#223760]/50 pb-2">
              <span className="text-[#b8c4d9] text-sm">Monthly Income</span>
              <span className={`${mono.className} text-white text-sm font-bold`}>₹ 2,00,000</span>
            </div>
            <div className="flex justify-between items-center border-b border-[#223760]/50 pb-2">
              <span className="text-[#b8c4d9] text-sm">Property Type</span>
              <span className="text-white text-sm font-bold">Residential</span>
            </div>
            <div className="flex justify-between items-center border-b border-[#223760]/50 pb-2">
              <span className="text-[#b8c4d9] text-sm">Property Usage</span>
              <span className="text-white text-sm font-bold">Self-Occupied</span>
            </div>
            <div className="pt-1">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-[#b8c4d9]">Loan Amount</span>
                <span className={`${mono.className} text-[#F7A755] font-bold text-base`}>₹ 1,00,00,000</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#16264D] overflow-hidden">
                <div className="h-full w-[60%] bg-[#F58220]" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Detailed Output Card Replica (Compacted) */}
        <div className="flex-1 flex flex-col justify-center relative">
          <div className="hidden xl:block absolute top-1/2 -left-6 w-6 h-[2px] bg-gradient-to-r from-transparent to-[#F58220]"></div>

          <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.4)] border-2 border-[#16264D] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3.5 border-b border-brand-100 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-brand-100 bg-white shadow-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 22H7L12 12L17 22H22L12 2Z" fill="#952B20"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#16264D]">{sampleBankName || "Axis Bank"}</h3>
              </div>
              <div className="bg-[#16264D] text-white text-[10px] font-bold px-3 py-1 rounded-full">
                Home Loan — Salaried
              </div>
            </div>

            {/* Inner Content Body */}
            <div className="p-4">
              <div className="bg-[#F4F7FB] border border-[#DDE3ED] rounded-xl p-4">
                
                {/* Row 1: Requested */}
                <div className="mb-4">
                  <div className="text-[9px] font-bold tracking-widest text-[#5F75A0] uppercase mb-0.5">Your Requested Loan Amount</div>
                  <div className={`${mono.className} text-2xl font-extrabold text-[#16264D]`}>₹1,00,00,000</div>
                </div>

                {/* Row 2: EMI & FOIR Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-[9px] font-bold tracking-widest text-[#5F75A0] uppercase">Max Allowed EMI</div>
                    <div className="text-[10px] text-[#5F75A0] mb-0.5">Bank's ceiling</div>
                    <div className={`${mono.className} text-lg font-bold text-[#16264D]`}>₹1,00,000</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold tracking-widest text-[#5F75A0] uppercase">Proposed EMI</div>
                    <div className="text-[10px] text-[#5F75A0] mb-0.5">For your request</div>
                    <div className={`${mono.className} text-lg font-bold text-[#16264D]`}>₹70,677</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold tracking-widest text-[#5F75A0] uppercase">FOIR</div>
                    <div className="text-[10px] text-[#5F75A0] mb-0.5">Share of income</div>
                    <div className="flex items-baseline gap-1">
                      <div className={`${mono.className} text-lg font-bold text-[#16264D]`}>35%</div>
                      <span className="text-success-500 font-bold text-xs">✓</span>
                    </div>
                  </div>
                </div>

                {/* Row 3: Sliders Box */}
                <div className="bg-white border border-[#DDE3ED] rounded-lg p-3 mb-4 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-[9px] font-bold tracking-widest text-[#5F75A0] uppercase mb-1.5">
                      <span>Tenure</span>
                      <span>25/25 Yrs</span>
                    </div>
                    <div className="h-1 w-full rounded-full bg-brand-100 relative mt-2">
                      <div className="absolute top-0 left-0 h-full w-full rounded-full bg-[#16264D]" />
                      <div className="absolute top-1/2 right-0 -translate-y-1/2 h-3 w-3 rounded-full bg-[#16264D] shadow" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-[9px] font-bold tracking-widest text-[#5F75A0] uppercase mb-1.5">Interest Rate</div>
                    <div className="flex items-center gap-2">
                      <div className="border border-brand-200 rounded px-2 py-1 text-xs font-bold text-[#16264D]">
                        {sampleRatePct || "7.00"}
                      </div>
                      <span className="text-[10px] text-[#5F75A0] font-medium">{sampleRatePct || "7.00"}%—12.00% range</span>
                    </div>
                  </div>
                </div>

                {/* Row 4: Messages */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium text-[#E06F10]">
                    Your age is reducing {sampleBankName || "Axis Bank"}'s usual 35-yr tenure to 25 yrs.
                  </p>
                  <p className="text-[12px] font-bold text-[#16264D] flex items-center gap-1.5">
                    <span className="text-[#16264D]">✓</span> You're eligible for your full requested ₹1,00,00,000.
                  </p>
                </div>

              </div>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
