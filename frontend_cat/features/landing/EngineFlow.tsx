"use client";

import { motion } from "framer-motion";

import type { LiveRate } from "@/lib/api/explore";

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

const SIZE = { w: 940, h: 460 };
const CORE = { x: 470, y: 230 };
const INPUT_X = 190;
const OUTPUT_X = 700;
const inputY = (i: number) => 70 + i * ((SIZE.h - 140) / 3);
const outputY = (i: number) => 55 + i * ((SIZE.h - 110) / 3);

function pct(v: number, total: number) {
  return `${((v / total) * 100).toFixed(3)}%`;
}

// A stylized, technical stand-in for the turbine — layered rotating rings
// plus thin radiating "blade" spokes for texture, all CSS/SVG. Not a
// photorealistic render (that needs an image generator, not code) but
// pushed as far as that toolset goes: more depth, more motion, more detail
// than a single flat gradient circle.
// Exported so LendersFlow.tsx (the "One Engine, Every Lender's Rules"
// section) can reuse the exact same core instead of a second, slightly
// different-looking one.
export function EngineCore() {
  const spokes = Array.from({ length: 12 }, (_, i) => i);
  return (
    <>
      <motion.svg
        width="170"
        height="170"
        viewBox="0 0 170 170"
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <circle cx="85" cy="85" r="82" fill="none" stroke="rgba(0,214,201,0.15)" strokeWidth="1" strokeDasharray="1 5" />
      </motion.svg>
      <motion.svg
        width="170"
        height="170"
        viewBox="0 0 170 170"
        className="absolute inset-0"
        animate={{ rotate: -360 }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        {spokes.map((i) => {
          const angle = (360 / spokes.length) * i;
          // Rounded — Math.cos/sin aren't guaranteed bit-identical between
          // Node's SSR pass and the browser's engine, which otherwise shows
          // up as a React hydration mismatch on these coordinates (hit this
          // exact bug once already with the previous engine visual).
          const x2 = Math.round((85 + 64 * Math.cos((angle * Math.PI) / 180)) * 100) / 100;
          const y2 = Math.round((85 + 64 * Math.sin((angle * Math.PI) / 180)) * 100) / 100;
          return <line key={i} x1="85" y1="85" x2={x2} y2={y2} stroke="rgba(24,224,255,0.2)" strokeWidth="1" />;
        })}
        <circle cx="85" cy="85" r="64" fill="none" stroke="rgba(24,224,255,0.35)" strokeWidth="1.5" />
      </motion.svg>
      <motion.svg
        width="170"
        height="170"
        viewBox="0 0 170 170"
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      >
        <circle cx="85" cy="85" r="46" fill="none" stroke="rgba(0,214,201,0.4)" strokeWidth="1.5" strokeDasharray="2 7" />
      </motion.svg>
      <motion.div
        className="absolute inset-0 m-auto flex h-[76px] w-[76px] flex-col items-center justify-center rounded-full text-center"
        animate={{ scale: [1, 1.07, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: "radial-gradient(circle at 35% 30%, #18E0FF 0%, #00D6C9 55%, #08141D 100%)",
          boxShadow: "0 0 55px rgba(0,214,201,0.55)",
        }}
      >
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#050B12]">The</span>
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#050B12]">Engine</span>
      </motion.div>
    </>
  );
}

function RankBadge({ rank }: { rank: number }) {
  return (
    <span className="rounded-full bg-[#7CFF8A]/15 px-2 py-0.5 text-[10px] font-bold text-[#7CFF8A]">
      Ranked #{rank}
    </span>
  );
}

// The top (rank 1) card gets full detail; the rest stay compact — matches
// the reference's cascading-stack composition without needing four full
// reason-lists' worth of vertical space.
function RankedCard({ rank, rate, compact }: { rank: number; rate: LiveRate; compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#08141D]/85 px-3 py-2 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#91A0AE]">#{rank}</span>
          <span className="text-xs font-semibold text-[#F5F7FA]">{rate.bank_name}</span>
        </div>
        <span className="text-xs font-bold text-[#18E0FF]">{rate.rate_pct.toFixed(2)}%</span>
      </div>
    );
  }
  return (
    <div
      className="rounded-2xl border border-[#7CFF8A]/30 bg-[#08141D]/90 p-3.5 backdrop-blur-md"
      style={{ boxShadow: "0 0 30px rgba(124,255,138,0.15)" }}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <RankBadge rank={rank} />
        <span className="text-[9px] text-[#91A0AE]">Illustrative</span>
      </div>
      <p className="text-sm font-bold text-[#F5F7FA]">{rate.bank_name}</p>
      <ul className="mt-1.5 flex flex-col gap-1 text-[10px] text-[#91A0AE]">
        <li>• Lowest live rate: {rate.rate_pct.toFixed(2)}%</li>
        <li>• Max loan estimated from your FOIR</li>
        <li>• High approval tier</li>
      </ul>
    </div>
  );
}

export function EngineFlow({ topRates }: { topRates: LiveRate[] }) {
  const cards = topRates.slice(0, 4);

  return (
    <>
      {/* Desktop/tablet: the full positioned diagram — fixed-width cards
          placed by percentage of a 940px design don't scale down cleanly
          below that, so this is sm: and up only (see the mobile stack
          below for phones). */}
      <div
        className="relative mx-auto hidden w-full sm:block"
        style={{ aspectRatio: `${SIZE.w} / ${SIZE.h}`, maxWidth: 940 }}
      >
        <svg viewBox={`0 0 ${SIZE.w} ${SIZE.h}`} className="absolute inset-0 h-full w-full overflow-visible">
          {INPUTS.map((input, i) => {
            const y = inputY(i);
            const path = `M ${INPUT_X} ${y} Q ${(INPUT_X + CORE.x) / 2} ${y}, ${CORE.x - 95} ${CORE.y}`;
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
          {cards.map((rate, i) => {
            const y = outputY(i);
            const path = `M ${CORE.x + 95} ${CORE.y} Q ${(CORE.x + OUTPUT_X) / 2} ${y}, ${OUTPUT_X} ${y}`;
            return (
              <g key={rate.bank_name}>
                <path d={path} fill="none" stroke="rgba(124,255,138,0.28)" strokeWidth="1.5" />
                <motion.circle
                  r="4"
                  fill="#7CFF8A"
                  style={{ offsetPath: `path("${path}")`, filter: "drop-shadow(0 0 5px #7CFF8A)" }}
                  animate={{ offsetDistance: ["0%", "100%"] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.3 + i * 0.25 }}
                />
              </g>
            );
          })}
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
          className="absolute h-[170px] w-[170px] -translate-x-1/2 -translate-y-1/2"
          style={{ left: pct(CORE.x, SIZE.w), top: pct(CORE.y, SIZE.h) }}
        >
          <EngineCore />
        </div>

        {cards.map((rate, i) => (
          <motion.div
            key={rate.bank_name}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + i * 0.12 }}
            className="absolute w-52 -translate-y-1/2"
            style={{ left: pct(OUTPUT_X, SIZE.w), top: pct(outputY(i), SIZE.h) }}
          >
            <RankedCard rank={i + 1} rate={rate} compact={i > 0} />
          </motion.div>
        ))}
      </div>

      {/* Mobile: a real stacked composition, not a shrunk version of the
          above — inputs in a row, arrow down to the core, arrow down to
          the ranked cards, all in normal document flow. */}
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
        <div className="relative h-[130px] w-[130px] shrink-0">
          <EngineCore />
        </div>
        <span className="text-[#7CFF8A]">↓</span>
        <div className="flex w-full max-w-xs flex-col gap-2">
          {cards.map((rate, i) => (
            <RankedCard key={rate.bank_name} rank={i + 1} rate={rate} compact={i > 0} />
          ))}
        </div>
      </div>
    </>
  );
}
