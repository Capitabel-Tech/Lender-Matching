const SIZE = 560;
const CENTER = SIZE / 2;
const INNER_RADIUS = 130;
const OUTER_RADIUS = 235;
const CORE_RADIUS = 46;

function pointOnCircle(index: number, count: number, radius: number, offset = 0) {
  const angle = (2 * Math.PI * index) / count - Math.PI / 2 + offset;
  // Rounded — see EngineVisual.tsx's identical comment: Math.cos/sin aren't
  // guaranteed bit-identical between server and client, which otherwise
  // shows up as a React hydration mismatch on these coordinates.
  return {
    x: Math.round((CENTER + radius * Math.cos(angle)) * 100) / 100,
    y: Math.round((CENTER + radius * Math.sin(angle)) * 100) / 100,
  };
}

// A denser, two-ring network — deliberately different from the hero's
// single-ring engine so this doesn't just repeat the same visual twice on
// one page. No interactivity needed here, so this stays a plain server
// component (only the CSS keyframes need to run, not JS).
export function LendersNetwork({ names }: { names: string[] }) {
  const half = Math.ceil(names.length / 2);
  const inner = names.slice(0, half).map((name, i) => ({ name, pos: pointOnCircle(i, half, INNER_RADIUS) }));
  const outer = names
    .slice(half)
    .map((name, i) => ({ name, pos: pointOnCircle(i, names.length - half, OUTER_RADIUS, Math.PI / (names.length - half)) }));
  const all = [...inner, ...outer];

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px]">
      <div
        className="absolute inset-0 rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(24,224,255,0.18) 0%, transparent 60%)" }}
      />
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 h-full w-full overflow-visible">
        {all.map((n, i) => (
          <line
            key={n.name}
            x1={CENTER}
            y1={CENTER}
            x2={n.pos.x}
            y2={n.pos.y}
            stroke={i % 5 === 0 ? "#7CFF8A" : "rgba(0,214,201,0.35)"}
            strokeWidth={i % 5 === 0 ? 1.4 : 0.75}
            strokeDasharray="3 7"
            className="motion-safe:[animation:dash-flow_2.2s_linear_infinite]"
          />
        ))}
      </svg>

      <div
        className="absolute flex items-center justify-center rounded-full text-center motion-safe:[animation:engine-pulse_4s_ease-in-out_infinite]"
        style={{
          left: `${((CENTER / SIZE) * 100).toFixed(3)}%`,
          top: `${((CENTER / SIZE) * 100).toFixed(3)}%`,
          width: CORE_RADIUS * 2,
          height: CORE_RADIUS * 2,
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle at 35% 30%, #18E0FF 0%, #00D6C9 55%, #08141D 100%)",
          boxShadow: "0 0 50px rgba(0,214,201,0.5)",
        }}
      >
        <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#050B12]">Engine</span>
      </div>

      {all.map((n, i) => (
        <span
          key={n.name}
          className="absolute whitespace-nowrap rounded-full border border-white/10 bg-[#08141D]/80 px-2 py-0.5 text-[10px] font-medium text-[#F5F7FA] backdrop-blur-sm motion-safe:[animation:node-float_6s_ease-in-out_infinite]"
          style={{
            left: `${((n.pos.x / SIZE) * 100).toFixed(3)}%`,
            top: `${((n.pos.y / SIZE) * 100).toFixed(3)}%`,
            transform: "translate(-50%, -50%)",
            animationDelay: `${(i % 6) * 0.35}s`,
          }}
        >
          {n.name}
        </span>
      ))}
    </div>
  );
}
