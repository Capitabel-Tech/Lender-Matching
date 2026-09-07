"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { LiveRate } from "@/lib/api/explore";

function BriefcaseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function BanknoteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="12" x="2" y="6" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const INPUTS = [
  { Icon: BriefcaseIcon, label: "Employment" },
  { Icon: HomeIcon, label: "Property" },
  { Icon: BanknoteIcon, label: "Loan Amount" },
  { Icon: UserIcon, label: "Age" },
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

// Needed by LendersFlow.tsx
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
      className="rounded-2xl border border-[#7CFF8A]/30 bg-[#08141D]/90 p-3.5 backdrop-blur-md relative"
      style={{ boxShadow: "0 0 30px rgba(124,255,138,0.15)" }}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <RankBadge rank={rank} />
        <span className="text-[9px] text-[#18E0FF]/70">BEST MATCH</span>
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
      <div
        className="relative mx-auto hidden w-full sm:block"
        style={{ aspectRatio: `${SIZE.w} / ${SIZE.h}`, maxWidth: 940 }}
      >
        <svg viewBox={`0 0 ${SIZE.w} ${SIZE.h}`} className="absolute inset-0 h-full w-full overflow-visible">
          {INPUTS.map((input, i) => {
            const y = inputY(i);
            const path = `M ${INPUT_X} ${y} Q ${(INPUT_X + CORE.x) / 2} ${y}, ${CORE.x - 110} ${CORE.y}`;
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
            const path = `M ${CORE.x + 110} ${CORE.y} Q ${(CORE.x + OUTPUT_X) / 2} ${y}, ${OUTPUT_X} ${y}`;
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
          className="absolute h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 mix-blend-screen"
          style={{ left: pct(CORE.x, SIZE.w), top: pct(CORE.y, SIZE.h) }}
        >
          <Image
            src="/engine-core.jpg"
            alt="Lender Match Engine 3D Core"
            fill
            className="object-contain"
            priority
            unoptimized
          />
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
        <div className="relative h-[200px] w-[200px] shrink-0 mix-blend-screen">
          <Image
            src="/engine-core.jpg"
            alt="Lender Match Engine 3D Core"
            fill
            className="object-contain"
            unoptimized
          />
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
