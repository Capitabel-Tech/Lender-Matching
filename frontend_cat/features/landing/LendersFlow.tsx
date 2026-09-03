"use client";

import { motion } from "framer-motion";

import { EngineCore } from "./EngineFlow";

function EmploymentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function PropertyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}

function RuleFoirIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="3" />
      <circle cx="17" cy="17" r="3" />
      <path d="m4 20 16-16" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

const RULES = [
  { Icon: EmploymentIcon, label: "Employment" },
  { Icon: PropertyIcon, label: "Property" },
  { Icon: RuleFoirIcon, label: "FOIR" },
  { Icon: LocationIcon, label: "Location" },
] as const;

const SIZE = { w: 1040, h: 520 };
const CORE = { x: 380, y: 260 };
const INPUT_X = 90;
const COL_X = [660, 960];
const inputY = (i: number) => 90 + i * ((SIZE.h - 180) / 3);

function pct(v: number, total: number) {
  return `${((v / total) * 100).toFixed(3)}%`;
}

// Same input -> engine -> output flow language as the hero (EngineFlow),
// deliberately replacing what used to be a circular/orbital diagram here —
// swapped out per explicit direction, not a style guess.
export function LendersFlow({ names }: { names: string[] }) {
  const perCol = Math.ceil(names.length / 2);
  const columns = [names.slice(0, perCol), names.slice(perCol)];
  const colY = (col: number, i: number) => {
    const count = columns[col].length;
    if (count <= 1) return SIZE.h / 2;
    return 40 + i * ((SIZE.h - 80) / (count - 1));
  };

  return (
    <div className="relative mx-auto hidden w-full sm:block" style={{ aspectRatio: `${SIZE.w} / ${SIZE.h}`, maxWidth: 1040 }}>
      <svg viewBox={`0 0 ${SIZE.w} ${SIZE.h}`} className="absolute inset-0 h-full w-full overflow-visible">
        {RULES.map((rule, i) => {
          const y = inputY(i);
          const path = `M ${INPUT_X} ${y} Q ${(INPUT_X + CORE.x) / 2} ${y}, ${CORE.x - 95} ${CORE.y}`;
          return (
            <g key={rule.label}>
              <path d={path} fill="none" stroke="rgba(0,214,201,0.25)" strokeWidth="1.5" />
              <motion.circle
                r="3.5"
                fill="#18E0FF"
                style={{ offsetPath: `path("${path}")`, filter: "drop-shadow(0 0 4px #18E0FF)" }}
                animate={{ offsetDistance: ["0%", "100%"] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "linear", delay: i * 0.4 }}
              />
            </g>
          );
        })}
        {columns.map((col, c) =>
          col.map((name, i) => {
            const y = colY(c, i);
            const path = `M ${CORE.x + 95} ${CORE.y} Q ${(CORE.x + COL_X[c]) / 2} ${y}, ${COL_X[c]} ${y}`;
            return (
              <g key={name}>
                <path d={path} fill="none" stroke="rgba(0,214,201,0.18)" strokeWidth="1" strokeDasharray="3 6" />
                <motion.circle
                  r="2.5"
                  fill="#00D6C9"
                  style={{ offsetPath: `path("${path}")`, filter: "drop-shadow(0 0 3px #00D6C9)" }}
                  animate={{ offsetDistance: ["0%", "100%"] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "linear", delay: (i % 6) * 0.3 }}
                />
              </g>
            );
          }),
        )}
      </svg>

      {RULES.map((rule, i) => (
        <motion.div
          key={rule.label}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="absolute flex -translate-y-1/2 items-center gap-2 rounded-xl border border-[#00D6C9]/25 bg-white/[0.04] px-3 py-2 backdrop-blur-md"
          style={{ left: 0, top: pct(inputY(i), SIZE.h) }}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#00D6C9]/10 text-[#18E0FF]">
            <rule.Icon />
          </span>
          <span className="text-xs font-semibold text-[#F5F7FA]">{rule.label}</span>
        </motion.div>
      ))}

      <div className="absolute h-[170px] w-[170px] -translate-x-1/2 -translate-y-1/2" style={{ left: pct(CORE.x, SIZE.w), top: pct(CORE.y, SIZE.h) }}>
        <EngineCore />
      </div>

      {columns.map((col, c) =>
        col.map((name, i) => (
          <span
            key={name}
            className="absolute max-w-[150px] -translate-y-1/2 truncate rounded-full border border-white/10 bg-[#08141D]/85 px-2.5 py-1 text-[11px] font-medium text-[#F5F7FA] backdrop-blur-sm"
            title={name}
            style={{ left: pct(COL_X[c], SIZE.w), top: pct(colY(c, i), SIZE.h) }}
          >
            {name}
          </span>
        )),
      )}
    </div>
  );
}

// Mobile: same real stacked composition principle as EngineFlow's mobile
// layout — rules row, arrow, core, arrow, then every lender name as a
// wrapped chip grid instead of a positioned diagram (which doesn't scale
// down cleanly with ~20 real names of very different lengths).
export function LendersFlowMobile({ names }: { names: string[] }) {
  return (
    <div className="flex flex-col items-center gap-4 sm:hidden">
      <div className="flex flex-wrap justify-center gap-2">
        {RULES.map((rule) => (
          <div key={rule.label} className="flex items-center gap-1.5 rounded-xl border border-[#00D6C9]/25 bg-white/[0.04] px-2.5 py-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#00D6C9]/10 text-[#18E0FF]">
              <rule.Icon />
            </span>
            <span className="text-xs font-semibold text-[#F5F7FA]">{rule.label}</span>
          </div>
        ))}
      </div>
      <span className="text-[#00D6C9]">↓</span>
      <div className="relative h-[130px] w-[130px] shrink-0">
        <EngineCore />
      </div>
      <span className="text-[#00D6C9]">↓</span>
      <div className="flex flex-wrap justify-center gap-2">
        {names.map((name) => (
          <span key={name} className="rounded-full border border-white/10 bg-[#08141D]/85 px-2.5 py-1 text-[11px] font-medium text-[#F5F7FA]">
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
