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
// Purely decorative — pointer-events-none throughout so its oversized
// (170px, bigger than most containers it's dropped into) absolutely
// positioned rings never sit on top of and swallow clicks meant for real
// controls placed near/under it (bit us on the login page's tab toggle).
export function EngineCore() {
  const spokes = Array.from({ length: 12 }, (_, i) => i);
  return (
    <>
      <motion.svg
        width="170"
        height="170"
        viewBox="0 0 170 170"
        className="pointer-events-none absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <circle cx="85" cy="85" r="82" fill="none" stroke="rgba(245,130,32,0.15)" strokeWidth="1" strokeDasharray="1 5" />
      </motion.svg>
      <motion.svg
        width="170"
        height="170"
        viewBox="0 0 170 170"
        className="pointer-events-none absolute inset-0"
        animate={{ rotate: -360 }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        {spokes.map((i) => {
          const angle = (360 / spokes.length) * i;
          const x2 = Math.round((85 + 64 * Math.cos((angle * Math.PI) / 180)) * 100) / 100;
          const y2 = Math.round((85 + 64 * Math.sin((angle * Math.PI) / 180)) * 100) / 100;
          return <line key={i} x1="85" y1="85" x2={x2} y2={y2} stroke="rgba(247,167,85,0.2)" strokeWidth="1" />;
        })}
        <circle cx="85" cy="85" r="64" fill="none" stroke="rgba(247,167,85,0.35)" strokeWidth="1.5" />
      </motion.svg>
      <motion.svg
        width="170"
        height="170"
        viewBox="0 0 170 170"
        className="pointer-events-none absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      >
        <circle cx="85" cy="85" r="46" fill="none" stroke="rgba(245,130,32,0.4)" strokeWidth="1.5" strokeDasharray="2 7" />
      </motion.svg>
      <motion.div
        className="pointer-events-none absolute inset-0 m-auto flex h-[76px] w-[76px] flex-col items-center justify-center rounded-full text-center"
        animate={{ scale: [1, 1.07, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: "radial-gradient(circle at 35% 30%, #F7A755 0%, #F58220 55%, #101D3D 100%)",
          boxShadow: "0 0 55px rgba(245,130,32,0.55)",
        }}
      >
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#0F1A33]">The</span>
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#0F1A33]">Engine</span>
      </motion.div>
    </>
  );
}

function RankBadge({ rank }: { rank: number }) {
  return (
    <span className="rounded-full bg-success-50 px-2 py-0.5 text-[10px] font-bold text-success-700">
      Ranked #{rank}
    </span>
  );
}

function RankedCard({ rank, rate, compact }: { rank: number; rate: LiveRate; compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-brand-100 bg-white/90 px-3 py-2 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-brand-500">#{rank}</span>
          <span className="text-xs font-semibold text-[#16264D]">{rate.bank_name}</span>
        </div>
        <span className="text-xs font-bold text-[#C2590A]">{rate.rate_pct.toFixed(2)}%</span>
      </div>
    );
  }
  return (
    <div
      className="rounded-2xl border border-success-500/30 bg-white/95 p-3.5 shadow-sm backdrop-blur-md relative"
      style={{ boxShadow: "0 0 30px rgba(31,138,91,0.12)" }}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <RankBadge rank={rank} />
        <span className="text-[9px] text-[#C2590A]/80">BEST MATCH</span>
      </div>
      <p className="text-sm font-bold text-[#16264D]">{rate.bank_name}</p>
      <ul className="mt-1.5 flex flex-col gap-1 text-[10px] text-brand-500">
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
                <path d={path} fill="none" stroke="rgba(245,130,32,0.25)" strokeWidth="1.5" />
                <motion.circle
                  r="3.5"
                  fill="#F7A755"
                  style={{ offsetPath: `path("${path}")`, filter: "drop-shadow(0 0 4px #F7A755)" }}
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
                <path d={path} fill="none" stroke="rgba(52,211,153,0.28)" strokeWidth="1.5" />
                <motion.circle
                  r="4"
                  fill="#34D399"
                  style={{ offsetPath: `path("${path}")`, filter: "drop-shadow(0 0 5px #34D399)" }}
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
            className="absolute flex -translate-y-1/2 items-center gap-2 rounded-xl border border-[#F58220]/25 bg-white px-3 py-2 shadow-sm"
            style={{ left: 0, top: pct(inputY(i), SIZE.h) }}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F58220]/10 text-[#C2590A]">
              <input.Icon />
            </span>
            <span className="text-xs font-semibold text-[#16264D]">{input.label}</span>
          </motion.div>
        ))}

        <div
          className="absolute h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-[#101D3D] shadow-[0_0_60px_rgba(16,29,61,0.25)]"
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
              className="flex items-center gap-1.5 rounded-xl border border-[#F58220]/25 bg-white px-2.5 py-1.5 shadow-sm"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#F58220]/10 text-[#C2590A]">
                <input.Icon />
              </span>
              <span className="text-xs font-semibold text-[#16264D]">{input.label}</span>
            </div>
          ))}
        </div>
        <span className="text-[#F58220]">↓</span>
        <div className="relative h-[200px] w-[200px] shrink-0 overflow-hidden rounded-full bg-[#101D3D] shadow-[0_0_40px_rgba(16,29,61,0.25)]">
          <Image
            src="/engine-core.jpg"
            alt="Lender Match Engine 3D Core"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
        <span className="text-success-500">↓</span>
        <div className="flex w-full max-w-xs flex-col gap-2">
          {cards.map((rate, i) => (
            <RankedCard key={rate.bank_name} rank={i + 1} rate={rate} compact={i > 0} />
          ))}
        </div>
      </div>
    </>
  );
}
