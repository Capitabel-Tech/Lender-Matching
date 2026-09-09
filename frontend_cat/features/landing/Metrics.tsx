import { motion } from "framer-motion";

interface Metric {
  value: string;
  label: string;
}

export function Metrics({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-4 w-full">
      {metrics.map((m, i) => (
        <motion.div 
          key={m.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.6 }}
          className="flex flex-col gap-2 bg-white border border-[#E2E8F0] shadow-[0_10px_30px_rgba(22,38,77,0.04)] rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:border-[#CBD5E1] hover:shadow-md transition-all"
        >
          {/* Subtle hover gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#F58220]/0 to-[#F58220]/[0.03] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          
          <p className="text-4xl font-black tracking-tighter text-[#16264D] sm:text-6xl relative z-10">{m.value}</p>
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#5F75A0] relative z-10 leading-relaxed">{m.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
