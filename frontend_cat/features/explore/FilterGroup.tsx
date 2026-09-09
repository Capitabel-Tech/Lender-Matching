"use client";

import type { FacetOption } from "@/lib/api/explore";

interface FilterGroupProps {
  title: string;
  options: FacetOption[];
  selected: string[];
  onToggle: (value: string) => void;
  // Optional: render options under sub-headings instead of one flat list —
  // used for Property Type, which has 14 values across 4 classifications.
  subgroups?: { heading: string; values: string[] }[];
  // "radio" — a native, required single-select, used only for Employment /
  // Income Type: a borrower only ever has one employment status, and
  // there's always a value once one's picked, so it can't be deselected.
  // "checkbox" (the default) is true multi-select — used for every other
  // category, where genuinely wanting "either of these" is a real use case
  // (e.g. banks that accept either Resale or New Purchase). ResultsList
  // narrows each card's display to just the values actually picked here,
  // so multi-select doesn't come at the cost of clarity on the card.
  mode?: "checkbox" | "radio";
}

function OptionRow({
  option,
  checked,
  onToggle,
  mode = "checkbox",
  groupName,
}: {
  option: FacetOption;
  checked: boolean;
  onToggle: (value: string) => void;
  mode?: "checkbox" | "radio";
  groupName?: string;
}) {
  const disabled = option.count === 0 && !checked;
  return (
    <label
      className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-3 text-sm transition-all ${
        checked
          ? "bg-[#FFF4EC] border border-[#FFE4CD]"
          : disabled
            ? "cursor-not-allowed opacity-40 border border-transparent"
            : "hover:bg-[#F8FAFC] border border-transparent"
      }`}
    >
      <span className="flex items-center gap-3">
        <input
          type={mode}
          name={mode === "radio" ? groupName : undefined}
          checked={checked}
          disabled={disabled}
          onChange={() => onToggle(option.value)}
          className={`h-5 w-5 border-[#CBD5E1] text-[#F58220] focus:ring-2 focus:ring-[#F58220]/30 ${mode === "checkbox" ? "rounded bg-white" : "rounded-full bg-white"}`}
        />
        <span className={`font-extrabold tracking-tight ${checked ? "text-[#C2590A]" : "text-[#16264D]"}`}>
          {option.label}
        </span>
      </span>
      <span
        className={`min-w-[1.75rem] rounded-full px-2 py-0.5 text-center text-[10px] uppercase font-bold tracking-wider ${
          checked
            ? "bg-[#F58220] text-white shadow-sm"
            : option.count === 0
              ? "text-[#94A3B8]"
              : "bg-[#F1F5F9] text-[#5F75A0]"
        }`}
      >
        {option.count}
      </span>
    </label>
  );
}

export function FilterGroup({ title, options, selected, onToggle, subgroups, mode = "checkbox" }: FilterGroupProps) {
  const byValue = new Map(options.map((o) => [o.value, o]));

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all hover:border-[#D1DFEF]">
      <h3 className="mb-4 border-l-4 border-[#F58220] pl-3 text-sm font-black uppercase tracking-widest text-[#16264D]">
        {title}
      </h3>
      {subgroups ? (
        <div className="flex flex-col gap-3">
          {subgroups.map((group) => {
            // No bank in the loaded data accepts anything in this
            // sub-group (e.g. Industrial), so there's nothing to check —
            // skip the heading entirely rather than showing an empty one.
            const availableValues = group.values.filter((value) => byValue.has(value));
            if (availableValues.length === 0) return null;
            return (
              <div key={group.heading}>
                <p className="mb-1.5 mt-2 px-2 text-[10px] font-bold uppercase tracking-widest text-[#5F75A0]">
                  {group.heading}
                </p>
                <div className="flex flex-col">
                  {availableValues.map((value) => (
                    <OptionRow
                      key={value}
                      option={byValue.get(value)!}
                      checked={selected.includes(value)}
                      onToggle={onToggle}
                      mode={mode}
                      groupName={title}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          {/* Safety net: a value the backend returns but that isn't in any
              known sub-group yet (e.g. an admin just added it and the
              grouping data hasn't caught up) still shows up here instead of
              silently vanishing from the sidebar. */}
          {(() => {
            const grouped = new Set(subgroups.flatMap((g) => g.values));
            const ungrouped = options.filter((o) => !grouped.has(o.value));
            if (ungrouped.length === 0) return null;
            return (
              <div>
                <p className="mb-1 px-2 text-xs font-bold uppercase tracking-wide text-brand-500 dark:text-brand-300">
                  Other
                </p>
                <div className="flex flex-col">
                  {ungrouped.map((option) => (
                    <OptionRow
                      key={option.value}
                      option={option}
                      checked={selected.includes(option.value)}
                      onToggle={onToggle}
                      mode={mode}
                      groupName={title}
                    />
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        <div className="flex flex-col">
          {options.map((option) => (
            <OptionRow
              key={option.value}
              option={option}
              checked={selected.includes(option.value)}
              onToggle={onToggle}
              mode={mode}
              groupName={title}
            />
          ))}
        </div>
      )}
    </div>
  );
}
