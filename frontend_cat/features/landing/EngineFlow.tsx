"use client";

import { motion } from "framer-motion";

// Purely decorative — pointer-events-none throughout so its oversized
// (170px, bigger than most containers it's dropped into) absolutely
// positioned rings never sit on top of and swallow clicks meant for real
// controls placed near/under it (bit us on the login page's tab toggle).
// Used by the login page and LendersFlow.tsx.
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
