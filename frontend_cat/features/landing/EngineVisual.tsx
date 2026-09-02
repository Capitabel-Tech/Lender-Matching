"use client";

import { useEffect, useRef, useState } from "react";

const RULE_LABELS = ["FOIR", "CREDIT SCORE", "INCOME", "PROPERTY", "LOCATION", "EMPLOYMENT", "LOAN AMOUNT", "TENURE"];

const SIZE = 520;
const CENTER = SIZE / 2;
const LENDER_RADIUS = 210;
const RULE_RADIUS = 120;
const CORE_RADIUS = 62;

function pointOnCircle(index: number, count: number, radius: number) {
  const angle = (2 * Math.PI * index) / count - Math.PI / 2;
  // Rounded to 2dp — Math.cos/sin aren't guaranteed bit-identical between
  // Node's SSR pass and the browser's own engine (both are V8, but transcendental
  // functions aren't required to match at the last bit), which otherwise shows
  // up as a React hydration mismatch on these coordinates.
  return {
    x: Math.round((CENTER + radius * Math.cos(angle)) * 100) / 100,
    y: Math.round((CENTER + radius * Math.sin(angle)) * 100) / 100,
  };
}

interface EngineVisualProps {
  lenderNames: string[];
  topMatchName: string | null;
  bankCount: number;
}

export function EngineVisual({ lenderNames, topMatchName, bankCount }: EngineVisualProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -8, y: px * 10 });
  }

  const nodes = lenderNames.map((name, i) => {
    const isTop = name === topMatchName;
    const isDim = i === lenderNames.length - 1;
    const pos = pointOnCircle(i, lenderNames.length, LENDER_RADIUS);
    return { name, pos, isTop, isDim, delay: (i % 6) * 0.4 };
  });

  const rules = RULE_LABELS.map((label, i) => ({
    label,
    pos: pointOnCircle(i, RULE_LABELS.length, RULE_RADIUS),
    delay: (i % 4) * 0.5,
  }));

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      className="relative mx-auto aspect-square w-full max-w-[520px]"
      style={{ perspective: "1400px" }}
    >
      <div
        className="relative h-full w-full transition-transform duration-300 ease-out"
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transformStyle: "preserve-3d" }}
      >
        {/* Radial glow behind everything */}
        <div
          className="absolute inset-0 rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(0,214,201,0.25) 0%, transparent 65%)" }}
        />

        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 h-full w-full overflow-visible">
          {/* Connecting lines: core -> each lender node */}
          {nodes.map((n) => (
            <line
              key={n.name}
              x1={CENTER}
              y1={CENTER}
              x2={n.pos.x}
              y2={n.pos.y}
              stroke={n.isDim ? "rgba(145,160,174,0.25)" : n.isTop ? "#7CFF8A" : "#00D6C9"}
              strokeWidth={n.isTop ? 1.6 : 1}
              strokeDasharray="4 6"
              className={reducedMotion ? "" : "motion-safe:[animation:dash-flow_1.8s_linear_infinite]"}
              opacity={n.isDim ? 0.5 : 0.85}
            />
          ))}
          {/* Faint lines: core -> rule labels (data feeding in) */}
          {rules.map((r) => (
            <line
              key={r.label}
              x1={CENTER}
              y1={CENTER}
              x2={r.pos.x}
              y2={r.pos.y}
              stroke="rgba(24,224,255,0.18)"
              strokeWidth={0.75}
            />
          ))}
          {/* Slowly spinning ring around the core */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={CORE_RADIUS + 18}
            fill="none"
            stroke="rgba(0,214,201,0.35)"
            strokeWidth={1}
            strokeDasharray="2 10"
            className="motion-safe:[animation:engine-ring-spin_18s_linear_infinite] [transform-origin:50%_50%]"
          />
        </svg>

        {/* Engine core */}
        <div
          className="absolute flex flex-col items-center justify-center rounded-full text-center motion-safe:[animation:engine-pulse_4s_ease-in-out_infinite]"
          style={{
            left: `${((CENTER / SIZE) * 100).toFixed(3)}%`,
            top: `${((CENTER / SIZE) * 100).toFixed(3)}%`,
            width: CORE_RADIUS * 2,
            height: CORE_RADIUS * 2,
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle at 35% 30%, #18E0FF 0%, #00D6C9 55%, #08141D 100%)",
            boxShadow: "0 0 60px rgba(0,214,201,0.55)",
          }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#050B12]">Lender</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#050B12]">Match</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#050B12]">Engine</span>
        </div>

        {/* Rule labels drifting toward the core */}
        {rules.map((r) => (
          <span
            key={r.label}
            className="absolute rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-[#91A0AE] backdrop-blur-sm motion-safe:[animation:node-float_5s_ease-in-out_infinite]"
            style={{
              left: `${((r.pos.x / SIZE) * 100).toFixed(3)}%`,
              top: `${((r.pos.y / SIZE) * 100).toFixed(3)}%`,
              transform: "translate(-50%, -50%)",
              animationDelay: `${r.delay}s`,
            }}
          >
            {r.label}
          </span>
        ))}

        {/* Lender nodes */}
        {nodes.map((n) => (
          <span
            key={n.name}
            className="absolute whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm motion-safe:[animation:node-float_6s_ease-in-out_infinite]"
            style={{
              left: `${((n.pos.x / SIZE) * 100).toFixed(3)}%`,
              top: `${((n.pos.y / SIZE) * 100).toFixed(3)}%`,
              transform: "translate(-50%, -50%)",
              animationDelay: `${n.delay}s`,
              borderColor: n.isDim ? "rgba(145,160,174,0.25)" : n.isTop ? "#7CFF8A" : "rgba(0,214,201,0.5)",
              background: n.isTop ? "rgba(124,255,138,0.12)" : "rgba(8,20,29,0.7)",
              color: n.isDim ? "#91A0AE" : n.isTop ? "#7CFF8A" : "#F5F7FA",
              boxShadow: n.isTop ? "0 0 20px rgba(124,255,138,0.4)" : undefined,
            }}
          >
            {n.name}
            {n.isTop && <span className="ml-1 text-[9px] text-[#7CFF8A]">✓ top match</span>}
          </span>
        ))}
      </div>

      {/* Technical status readouts — not a card, just floating labels */}
      <div className="absolute -bottom-2 left-0 flex flex-col gap-1 font-mono text-[10px] uppercase tracking-wide text-[#91A0AE] sm:-left-4">
        <p>
          Status: <span className="text-[#7CFF8A]">active</span>
        </p>
        <p>Lenders tracked: {bankCount}</p>
        {topMatchName && <p>Top match (demo): {topMatchName}</p>}
      </div>
      <p className="absolute -bottom-2 right-0 font-mono text-[10px] uppercase tracking-wide text-[#91A0AE] sm:-right-4">
        Illustrative
      </p>
    </div>
  );
}
