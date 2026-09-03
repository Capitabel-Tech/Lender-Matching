"use client";

import { motion } from "framer-motion";

function CibilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20M6 15h4" />
    </svg>
  );
}

function FoirIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="3" />
      <circle cx="17" cy="17" r="3" />
      <path d="m4 20 16-16" />
    </svg>
  );
}

function IncomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 6.5c0-1.9-2.2-3.5-5-3.5S7 4.6 7 6.5 9.2 10 12 10s5 1.6 5 3.5-2.2 3.5-5 3.5-5-1.6-5-3.5" />
    </svg>
  );
}

function DocsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6M9 13h6M9 17h6" />
    </svg>
  );
}

const INPUTS = [
  { Icon: CibilIcon, label: "CIBIL" },
  { Icon: FoirIcon, label: "FOIR" },
  { Icon: IncomeIcon, label: "Income" },
  { Icon: DocsIcon, label: "Documents" },
] as const;

const SIZE = { w: 900, h: 420 };
const CORE = { x: 450, y: 210 };
const INPUT_X = 190;
const OUTPUT_X = 710;
const inputY = (i: number) => 60 + i * ((SIZE.h - 120) / 3);

function pct(v: number, total: number) {
  return `${((v / total) * 100).toFixed(3)}%`;
}

function EngineCore() {
  return (
    <>
      <motion.svg
        width="150"
        height="150"
        viewBox="0 0 150 150"
        animate={{ rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      >
        <circle cx="75" cy="75" r="72" fill="none" stroke="rgba(0,214,201,0.18)" strokeWidth="1" strokeDasharray="2 6" />
      </motion.svg>
      <motion.svg
        width="150"
        height="150"
        viewBox="0 0 150 150"
        className="absolute inset-0"
        animate={{ rotate: -360 }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
      >
        <circle cx="75" cy="75" r="56" fill="none" stroke="rgba(24,224,255,0.3)" strokeWidth="1.5" strokeDasharray="1 8" />
      </motion.svg>
      <motion.div
        className="absolute inset-0 m-auto flex h-24 w-24 flex-col items-center justify-center rounded-full text-center"
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: "radial-gradient(circle at 35% 30%, #18E0FF 0%, #00D6C9 55%, #08141D 100%)",
          boxShadow: "0 0 45px rgba(0,214,201,0.5)",
        }}
      >
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#050B12]">The</span>
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#050B12]">Engine</span>
      </motion.div>
    </>
  );
}

function ResultCardBody({ topBankName, topRatePct }: { topBankName: string | null; topRatePct: number | null }) {
  return (
    <>
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-full bg-[#7CFF8A]/15 px-2 py-0.5 text-[10px] font-bold text-[#7CFF8A]">Ranked #1</span>
        <span className="text-[9px] text-[#91A0AE]">Illustrative</span>
      </div>
      <p className="text-sm font-bold text-[#F5F7FA]">{topBankName ?? "Sample Bank"}</p>
      <ul className="mt-2 flex flex-col gap-1 text-[11px] text-[#91A0AE]">
        <li>• Lowest live rate{topRatePct !== null ? `: ${topRatePct.toFixed(2)}%` : ""}</li>
        <li>• Max loan estimated from your FOIR</li>
        <li>• High approval tier</li>
      </ul>
    </>
  );
}

export function EngineFlow({
  topBankName,
  topRatePct,
}: {
  topBankName: string | null;
  topRatePct: number | null;
}) {
  return (
    <>
      {/* Desktop/tablet: the full positioned diagram — fixed-width cards
          placed by percentage of a 900px design don't scale down cleanly
          below that (the result card's text was getting clipped past the
          viewport edge on phones), so this is sm: and up only. */}
      <div
        className="relative mx-auto hidden w-full sm:block"
        style={{ aspectRatio: `${SIZE.w} / ${SIZE.h}`, maxWidth: 900 }}
      >
        <svg viewBox={`0 0 ${SIZE.w} ${SIZE.h}`} className="absolute inset-0 h-full w-full overflow-visible">
          {INPUTS.map((input, i) => {
            const y = inputY(i);
            const path = `M ${INPUT_X} ${y} Q ${(INPUT_X + CORE.x) / 2} ${y}, ${CORE.x - 90} ${CORE.y}`;
            return (
              <g key={input.label}>
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
          {(() => {
            const path = `M ${CORE.x + 90} ${CORE.y} Q ${(CORE.x + OUTPUT_X) / 2} ${CORE.y}, ${OUTPUT_X} ${CORE.y}`;
            return (
              <g>
                <path d={path} fill="none" stroke="rgba(124,255,138,0.3)" strokeWidth="1.5" />
                <motion.circle
                  r="4"
                  fill="#7CFF8A"
                  style={{ offsetPath: `path("${path}")`, filter: "drop-shadow(0 0 5px #7CFF8A)" }}
                  animate={{ offsetDistance: ["0%", "100%"] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
                />
              </g>
            );
          })()}
        </svg>

        {INPUTS.map((input, i) => (
          <motion.div
            key={input.label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="absolute flex -translate-y-1/2 items-center gap-2 rounded-xl border border-[#00D6C9]/25 bg-white/[0.04] px-3 py-2 backdrop-blur-md"
            style={{ left: 0, top: pct(inputY(i), SIZE.h) }}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00D6C9]/10 text-[#18E0FF]">
              <input.Icon />
            </span>
            <span className="text-xs font-semibold text-[#F5F7FA]">{input.label}</span>
          </motion.div>
        ))}

        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: pct(CORE.x, SIZE.w), top: pct(CORE.y, SIZE.h) }}
        >
          <EngineCore />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="absolute w-56 -translate-y-1/2 rounded-2xl border border-[#7CFF8A]/30 bg-[#08141D]/90 p-4 backdrop-blur-md"
          style={{ left: pct(OUTPUT_X, SIZE.w), top: pct(CORE.y, SIZE.h), boxShadow: "0 0 30px rgba(124,255,138,0.15)" }}
        >
          <ResultCardBody topBankName={topBankName} topRatePct={topRatePct} />
        </motion.div>
      </div>

      {/* Mobile: a real stacked composition, not a shrunk version of the
          above — inputs in a row, arrow down to the core, arrow down to
          the result card, all in normal document flow. */}
      <div className="flex flex-col items-center gap-4 sm:hidden">
        <div className="flex flex-wrap justify-center gap-2">
          {INPUTS.map((input) => (
            <div
              key={input.label}
              className="flex items-center gap-1.5 rounded-xl border border-[#00D6C9]/25 bg-white/[0.04] px-2.5 py-1.5"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#00D6C9]/10 text-[#18E0FF]">
                <input.Icon />
              </span>
              <span className="text-xs font-semibold text-[#F5F7FA]">{input.label}</span>
            </div>
          ))}
        </div>
        <span className="text-[#00D6C9]">↓</span>
        <div className="relative h-28 w-28 shrink-0">
          <EngineCore />
        </div>
        <span className="text-[#7CFF8A]">↓</span>
        <div
          className="w-full max-w-xs rounded-2xl border border-[#7CFF8A]/30 bg-[#08141D]/90 p-4"
          style={{ boxShadow: "0 0 30px rgba(124,255,138,0.15)" }}
        >
          <ResultCardBody topBankName={topBankName} topRatePct={topRatePct} />
        </div>
      </div>
    </>
  );
}
