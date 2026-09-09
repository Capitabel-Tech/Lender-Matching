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
      className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-2.5 text-base transition-colors ${
        checked
          ? "bg-brand-50 dark:bg-brand-950/40"
          : disabled
            ? "cursor-not-allowed opacity-40"
            : "hover:bg-brand-50 dark:hover:bg-brand-600"
      }`}
    >
      <span className="flex items-center gap-2.5">
        <input
          type={mode}
          name={mode === "radio" ? groupName : undefined}
          checked={checked}
          disabled={disabled}
          onChange={() => onToggle(option.value)}
          className={`h-5 w-5 border-brand-300 text-brand-700 focus:ring-2 focus:ring-brand-500 dark:border-brand-500 ${mode === "checkbox" ? "rounded" : "rounded-full"}`}
        />
        <span className={`font-semibold ${checked ? "text-brand-900 dark:text-brand-200" : "text-brand-600 dark:text-brand-100"}`}>
          {option.label}
        </span>
      </span>
      <span
        className={`min-w-[1.75rem] rounded-full px-1.5 py-0.5 text-center text-xs font-bold ${
          checked
            ? "bg-brand-700 text-white"
            : option.count === 0
              ? "text-brand-200 dark:text-brand-500"
              : "bg-brand-50 text-brand-500 dark:bg-brand-600 dark:text-brand-300"
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
    <div className="rounded-xl border border-brand-100 bg-white p-4 shadow-sm dark:border-brand-600 dark:bg-brand-800">
      <h3 className="mb-3 border-l-4 border-brand-700 pl-2.5 text-base font-black uppercase tracking-wide text-brand-800 dark:text-cream-100">
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
                <p className="mb-1 px-2 text-xs font-bold uppercase tracking-wide text-brand-500 dark:text-brand-300">
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
