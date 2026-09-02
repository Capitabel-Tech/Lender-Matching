import type { LiveRate } from "@/lib/api/explore";

// A handful of distinct colors to tell the icon squares apart, since we
// have no real bank logos to show — cycled by position, not tied to any
// specific bank.
const ICON_COLORS = ["bg-rose-600", "bg-teal-600", "bg-indigo-600"];

// Deliberately static, not the real tool — a landing page should sell the
// idea with a preview, not hand over a working instance of the product
// itself (that's what "Explore Lenders" is for). Every number shown is
// still real, current data; nothing here is fabricated, it's just not
// editable from this page.
export function ProductPreview({ rates }: { rates: LiveRate[] }) {
  const topThree = rates.slice(0, 3);

  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-zinc-900/5 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] dark:border-white/5 dark:bg-zinc-900 sm:p-7">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Sample match preview</p>
        <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-[11px] font-bold text-teal-800 dark:bg-teal-950/40 dark:text-teal-300">
          Live rates
        </span>
      </div>

      <div className="flex flex-col gap-2 opacity-70">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">Monthly income</span>
          <span className="font-semibold text-zinc-700 dark:text-zinc-200">₹ 80,000</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">Loan amount</span>
          <span className="font-semibold text-zinc-700 dark:text-zinc-200">₹ 50,00,000</span>
        </div>
        {/* Decorative — illustrates the tool's slider, isn't a real control here. */}
        <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div className="h-1.5 w-1/3 rounded-full bg-zinc-400 dark:bg-zinc-600" />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">Tenure</span>
          <span className="font-semibold text-zinc-700 dark:text-zinc-200">20 Years</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Top matched lenders</p>
        {topThree.length === 0 && <p className="text-sm text-zinc-400">Loading live rates…</p>}
        <div className="flex flex-col gap-2">
          {topThree.map((r, i) => (
            <div
              key={r.bank_name}
              className="flex items-center gap-3 rounded-xl border border-zinc-100 px-3 py-2.5 dark:border-zinc-800"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white ${ICON_COLORS[i % ICON_COLORS.length]}`}
              >
                {r.bank_name.charAt(0)}
              </span>
              <p className="flex-1 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{r.bank_name}</p>
              <span className="text-base font-bold text-teal-700 dark:text-teal-400">{r.rate_pct.toFixed(2)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
