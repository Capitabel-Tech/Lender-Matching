interface Metric {
  value: string;
  label: string;
}

export function Metrics({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-4">
      {metrics.map((m) => (
        <div key={m.label} className="flex flex-col gap-1">
          <p className="text-5xl font-bold tracking-tight text-[#F5F7FA] sm:text-7xl">{m.value}</p>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#91A0AE]">{m.label}</p>
        </div>
      ))}
    </div>
  );
}
