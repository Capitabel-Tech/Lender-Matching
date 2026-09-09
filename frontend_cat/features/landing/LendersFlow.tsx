"use client";

import { motion } from "framer-motion";

function EmploymentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function PropertyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}

function RuleFoirIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="3" />
      <circle cx="17" cy="17" r="3" />
      <path d="m4 20 16-16" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function CpuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
      <path d="M9 9h6v6H9z" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
    </svg>
  );
}

const RULES = [
  { Icon: EmploymentIcon, label: "Employment Profile" },
  { Icon: PropertyIcon, label: "Property Details" },
  { Icon: RuleFoirIcon, label: "Financials & FOIR" },
  { Icon: LocationIcon, label: "Geographical Limits" },
] as const;

// Coordinate System for Absolute SVG Layout
const SIZE = { w: 1200, h: 420 };
const CORE = { x: 600, y: 210 };
const LEFT_X = 200;
const RIGHT_X = [880, 1060];
const Y_POS = [90, 170, 250, 330];

function pct(v: number, total: number) {
  return `${((v / total) * 100).toFixed(3)}%`;
}

export function LendersFlow({ names }: { names: string[] }) {
  // Only keep 8 banks for an effective, spacious design
  const topBanks = names.slice(0, 8);
  const columns = [topBanks.slice(0, 4), topBanks.slice(4, 8)];

  return (
    <div className="relative w-full hidden sm:block bg-white rounded-3xl border border-[#E2E8F0] shadow-[0_15px_40px_rgba(0,0,0,0.06)] overflow-hidden group" style={{ aspectRatio: `${SIZE.w} / ${SIZE.h}` }}>
      
      {/* Background subtle grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#16264D 1.5px, transparent 1.5px)", backgroundSize: "32px 32px" }}></div>

      <svg viewBox={`0 0 ${SIZE.w} ${SIZE.h}`} className="absolute inset-0 h-full w-full overflow-visible pointer-events-none z-0">
        
        {/* Left to Core Paths & Dots */}
        {RULES.map((_, i) => {
          const path = `M ${LEFT_X} ${Y_POS[i]} C ${(LEFT_X + CORE.x) / 2} ${Y_POS[i]}, ${(LEFT_X + CORE.x) / 2} ${CORE.y}, ${CORE.x} ${CORE.y}`;
          return (
            <g key={`l-${i}`}>
              <path d={path} fill="none" stroke="#F58220" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
              <motion.circle
                r="5"
                fill="#F58220"
                style={{ offsetPath: `path("${path}")`, filter: "drop-shadow(0 0 6px rgba(245,130,32,0.8))" }}
                animate={{ offsetDistance: ["0%", "100%"] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "linear", delay: i * 0.4 }}
              />
            </g>
          );
        })}

        {/* Core to Right Paths & Dots */}
        {columns.map((col, c) =>
          col.map((_, i) => {
            const startX = CORE.x;
            const endX = RIGHT_X[c];
            const path = `M ${startX} ${CORE.y} C ${(startX + endX) / 2} ${CORE.y}, ${(startX + endX) / 2} ${Y_POS[i]}, ${endX} ${Y_POS[i]}`;
            return (
              <g key={`r-${c}-${i}`}>
                <path d={path} fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 6" opacity="0.6" />
                <motion.circle
                  r="4"
                  fill="#16264D"
                  style={{ offsetPath: `path("${path}")`, filter: "drop-shadow(0 0 5px rgba(22,38,77,0.4))" }}
                  animate={{ offsetDistance: ["0%", "100%"] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "linear", delay: (c * 4 + i) * 0.2 }}
                />
              </g>
            );
          }),
        )}
      </svg>

      {/* Rule Nodes (Inputs) */}
      {RULES.map((rule, i) => (
        <motion.div
          key={rule.label}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: i * 0.15 }}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-sm w-[210px] z-10"
          style={{ left: pct(LEFT_X, SIZE.w), top: pct(Y_POS[i], SIZE.h) }}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF4EC] text-[#F58220]">
            <rule.Icon />
          </span>
          <span className="text-sm font-extrabold text-[#16264D]">{rule.label}</span>
        </motion.div>
      ))}

      {/* Central Engine Core */}
      <div 
        className="absolute w-44 h-44 rounded-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20"
        style={{ left: pct(CORE.x, SIZE.w), top: pct(CORE.y, SIZE.h) }}
      >
        {/* Animated Outer Rings for 3D Effect */}
        <motion.div 
          className="absolute inset-0 rounded-full border border-[#F58220]/30 shadow-[0_0_40px_rgba(245,130,32,0.15)]"
          animate={{ rotate: 360, scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute inset-2 rounded-full border-2 border-dashed border-[#F58220]/40"
          animate={{ rotate: -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        
        <div className="relative w-32 h-32 bg-[#16264D] border border-[#223760] shadow-[0_15px_35px_rgba(22,38,77,0.3)] rounded-full flex flex-col items-center justify-center">
          <CpuIcon className="h-8 w-8 text-[#F58220] mb-1" />
          <span className="text-[11px] font-black tracking-widest text-white">THE ENGINE</span>
        </div>
      </div>

      {/* Bank Nodes (Outputs) */}
      {columns.map((col, c) =>
        col.map((name, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + ((c * 4) + i) * 0.1, duration: 0.4 }}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-4 py-2 w-[160px] shadow-sm z-10"
            style={{ left: pct(RIGHT_X[c], SIZE.w), top: pct(Y_POS[i], SIZE.h) }}
          >
            <div className="h-2 w-2 shrink-0 rounded-full bg-[#16264D] shadow-[0_0_4px_rgba(22,38,77,0.4)]"></div>
            <span className="text-xs font-bold text-[#16264D] truncate">{name}</span>
          </motion.div>
        )),
      )}
    </div>
  );
}

export function LendersFlowMobile({ names }: { names: string[] }) {
  const topBanks = names.slice(0, 8); // Slice mobile banks too
  return (
    <div className="flex flex-col items-center gap-8 sm:hidden w-full bg-white rounded-3xl border border-[#E2E8F0] p-8 shadow-md relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#16264D 1.5px, transparent 1.5px)", backgroundSize: "32px 32px" }}></div>

      <div className="flex flex-col w-full gap-3 z-10">
        {RULES.map((rule) => (
          <div key={rule.label} className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-sm w-full">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF4EC] text-[#F58220]">
              <rule.Icon />
            </span>
            <span className="text-sm font-extrabold text-[#16264D]">{rule.label}</span>
          </div>
        ))}
      </div>
      
      <div className="text-[#F58220] animate-bounce z-10">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
      </div>
      
      <div className="relative w-40 h-40 flex items-center justify-center z-10">
        <motion.div 
          className="absolute inset-0 rounded-full border border-[#F58220]/30"
          animate={{ rotate: 360, scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
        <div className="relative w-28 h-28 bg-[#16264D] border border-[#223760] shadow-[0_15px_30px_rgba(22,38,77,0.3)] rounded-full flex flex-col items-center justify-center">
          <CpuIcon className="h-8 w-8 text-[#F58220] mb-1" />
          <span className="text-[10px] font-black tracking-widest text-white">ENGINE</span>
        </div>
      </div>
      
      <div className="text-[#F58220] animate-bounce z-10">
         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
      </div>
      
      <div className="flex flex-wrap justify-center gap-2.5 z-10">
        {topBanks.map((name) => (
          <span key={name} className="rounded-full border border-[#E2E8F0] bg-white px-3.5 py-1.5 text-xs font-bold text-[#16264D] shadow-sm flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-[#16264D]"></div>
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
