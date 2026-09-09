import type { LiveRate } from "@/lib/api/explore";
import { motion } from "framer-motion";

export function MatchScore({ rates }: { rates: LiveRate[] }) {
  const top = rates.slice(0, 5);
  if (top.length === 0) return null;

  return (
    <div className="w-full bg-white border border-[#E2E8F0] shadow-[0_20px_60px_rgba(22,38,77,0.06)] rounded-[32px] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-6 sm:px-10 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-success-500 shadow-[0_0_8px_rgba(31,138,91,0.6)] animate-pulse"></div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#16264D]">Live Ranking Engine</span>
        </div>
        <span className="text-xs font-bold text-[#5F75A0] bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-full shadow-sm">
          Top 5 Matches Evaluated
        </span>
      </div>

      {/* Leaderboard */}
      <div className="p-6 sm:p-10 flex flex-col gap-4 bg-white relative">
        {/* Subtle background grid */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "radial-gradient(#16264D 1.5px, transparent 1.5px)", backgroundSize: "24px 24px" }}></div>

        {top.map((r, i) => {
          const isTop = i === 0;
          return (
            <motion.div 
              key={r.bank_name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`flex items-center justify-between p-5 sm:p-6 rounded-2xl border relative z-10 ${
                isTop 
                  ? "bg-[#FFF4EC] border-[#FFE4CD] shadow-[0_8px_20px_rgba(245,130,32,0.12)] overflow-hidden scale-[1.02]" 
                  : "bg-white border-[#E2E8F0] hover:border-[#CBD5E1] hover:shadow-md transition-all"
              }`}
            >
              {isTop && (
                <div className="absolute top-0 right-0 bottom-0 w-48 bg-gradient-to-l from-[#F58220]/15 to-transparent pointer-events-none"></div>
              )}
              
              <div className="flex items-center gap-4 sm:gap-6">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-sm sm:text-base font-black ${
                  isTop ? "bg-[#F58220] text-white shadow-md" : "bg-[#F8FAFC] text-[#5F75A0] border border-[#E2E8F0]"
                }`}>
                  #{i + 1}
                </div>
                <div className="flex flex-col">
                  <h4 className={`text-base sm:text-xl font-extrabold tracking-tight ${isTop ? "text-[#C2590A]" : "text-[#16264D]"}`}>
                    {r.bank_name}
                  </h4>
                  {isTop && <p className="text-[10px] sm:text-xs font-bold text-[#F58220] uppercase tracking-[0.15em] mt-1">Best Match Found</p>}
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className={`text-2xl sm:text-3xl font-black tracking-tighter ${isTop ? "text-[#F58220]" : "text-[#16264D]"}`}>
                  {r.rate_pct.toFixed(2)}%
                </span>
                <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] ${isTop ? "text-[#C2590A]/70" : "text-[#5F75A0]"}`}>
                  Published Rate
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
      
      {/* Footer Disclaimer */}
      <div className="bg-[#F8FAFC] border-t border-[#E2E8F0] px-6 py-4 text-center">
        <p className="text-[11px] font-bold text-[#5F75A0] uppercase tracking-wider">Ranked by published interest rate — not a personalized result.</p>
      </div>
    </div>
  );
}
