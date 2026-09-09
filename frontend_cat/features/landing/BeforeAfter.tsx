import { motion } from "framer-motion";

export function BeforeAfter() {
  return (
    <div className="grid gap-8 sm:grid-cols-2 w-full">
      {/* Without LenderMatch */}
      <div className="flex flex-col bg-white rounded-[32px] border border-[#E2E8F0] overflow-hidden shadow-sm">
        <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-8 py-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5F75A0]">The Old Way</p>
        </div>
        <div className="p-8 flex flex-col justify-center gap-10 relative min-h-[380px]">
          {/* Messy path SVG */}
          <svg className="absolute top-[72px] left-[52px] w-10 h-[calc(100%-140px)] -z-10" overflow="visible">
            <path d="M 0 0 L 0 50 C 0 80, -30 80, -30 110 C -30 140, 0 140, 0 170 L 0 220" fill="none" stroke="#E2E8F0" strokeWidth="3" strokeDasharray="6 6" />
          </svg>

          <div className="flex items-center gap-6">
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center text-[#5F75A0]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <div>
              <p className="font-extrabold text-[#16264D] text-lg">Apply Blindly</p>
              <p className="text-sm font-medium text-[#5F75A0] mt-1">Fill out endless forms without knowing the exact rules.</p>
            </div>
          </div>

          <div className="flex items-center gap-6 opacity-70">
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#5F75A0]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div>
              <p className="font-extrabold text-[#16264D] text-lg">Wait for Weeks</p>
              <p className="text-sm font-medium text-[#5F75A0] mt-1">Manual processing by bankers takes forever.</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#FFF0F0] border border-[#FECACA] flex items-center justify-center text-[#DC2626] shadow-sm">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
            <div>
              <p className="font-extrabold text-[#DC2626] text-lg">Rejected</p>
              <p className="text-sm font-medium text-[#5F75A0] mt-1">Failed a hidden criteria. Start over.</p>
            </div>
          </div>

        </div>
      </div>

      {/* With LenderMatch */}
      <div className="flex flex-col bg-[#16264D] rounded-[32px] border border-[#223760] overflow-hidden shadow-[0_20px_40px_rgba(22,38,77,0.4)] relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#F58220]/20 via-[#16264D]/0 to-[#16264D]/0 pointer-events-none"></div>
        
        <div className="bg-[#223760]/50 border-b border-[#223760] px-8 py-5 relative z-10 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#F58220] shadow-[0_0_8px_#F58220] animate-pulse"></div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white">
            The LenderMatch Engine
          </p>
        </div>
        
        <div className="p-8 flex flex-col justify-center gap-10 relative z-10 min-h-[380px]">
          {/* Straight path SVG with animated dot */}
          <svg className="absolute top-[72px] left-[52px] w-10 h-[calc(100%-140px)] -z-10" overflow="visible">
            <path id="fast-path" d="M 0 0 L 0 220" fill="none" stroke="#F58220" strokeWidth="3" opacity="0.3" />
            <motion.circle
              r="5"
              fill="#F58220"
              style={{ filter: "drop-shadow(0 0 8px #F58220)" }}
              animate={{ cy: ["0px", "220px"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              cx="0"
            />
          </svg>

          <div className="flex items-center gap-6">
             <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#223760] border border-[#334971] shadow-lg flex items-center justify-center text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <p className="font-extrabold text-white text-lg">Create Profile</p>
              <p className="text-sm font-medium text-[#8B9DBB] mt-1">One simple form, strict data privacy.</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#223760] border border-[#334971] shadow-[0_0_20px_rgba(245,130,32,0.15)] flex items-center justify-center text-[#F58220]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><path d="M9 9h6v6H9z"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/></svg>
            </div>
            <div>
              <p className="font-extrabold text-white text-lg">Live Evaluation</p>
              <p className="text-sm font-medium text-[#8B9DBB] mt-1">Engine evaluates hundreds of rules in seconds.</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-success-400 to-success-600 border border-success-400 shadow-[0_0_25px_rgba(31,138,91,0.4)] flex items-center justify-center text-white">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <p className="font-extrabold text-success-400 text-lg">Guaranteed Match</p>
              <p className="text-sm font-medium text-[#8B9DBB] mt-1">Apply only to banks that will approve you.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
