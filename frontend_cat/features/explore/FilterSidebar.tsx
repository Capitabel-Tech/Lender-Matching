"use client";

import type { ExploreFilters, ExploreResponse, FilterCategory, PropertyTypeGroup } from "@/lib/api/explore";

import { AffordabilityForm } from "./AffordabilityForm";
import { FilterGroup } from "./FilterGroup";

const CATEGORY_TITLES: Record<FilterCategory, string> = {
  employment_type: "Employment / Income Type",
  property_type: "Property Type",
  property_usage: "Property Usage",
  property_stage: "Property Stage",
  property_location: "Property Location",
};

// Employment type first, then the affordability inputs (age/income/
// obligations), then everything else — the order asked for.
const CATEGORIES_AFTER_AFFORDABILITY: FilterCategory[] = [
  "property_type",
  "property_usage",
  "property_stage",
  "property_location",
];

interface FilterSidebarProps {
  filters: ExploreFilters;
  facets: ExploreResponse["facets"] | null;
  propertyTypeGroups: PropertyTypeGroup[];
  activeCount: number;
  // Whether to show the "Clear filters" button — true whenever *anything*
  // is set, not just category checkboxes (activeCount alone would hide the
  // button when only Age/Income/Obligations are filled in).
  showClear: boolean;
  // Property Type/Usage/Stage/Location — optional single-select (see
  // FilterGroup's "single" mode): picking a value replaces any other in
  // that category, and picking the already-selected one clears it.
  onSingleSelect: (category: FilterCategory, value: string) => void;
  // Employment / Income Type is single-select and required (see
  // FilterGroup's "radio" mode) — a separate handler because it always
  // *sets* the selection to exactly this one value and can never go back to
  // empty, unlike onSingleSelect above.
  onEmploymentTypeChange: (value: string) => void;
  onClear: () => void;
  requestedLoanAmount: number | null;
  onAgeChange: (value: number | null) => void;
  onMonthlyIncomeChange: (value: number | null) => void;
  onObligationsChange: (amounts: number[]) => void;
  onRequestedLoanAmountChange: (value: number | null) => void;
  // Bumped on every "Clear filters" click — passed to AffordabilityForm as
  // its `key`, forcing it to remount and drop its own local row state,
  // which a plain prop reset can't reach (see ExplorePage's comment).
  affordabilityResetKey: number;
}

export function FilterSidebar({
  filters,
  facets,
  propertyTypeGroups,
  activeCount,
  showClear,
  onSingleSelect,
  onEmploymentTypeChange,
  onClear,
  requestedLoanAmount,
  onAgeChange,
  onMonthlyIncomeChange,
  onObligationsChange,
  onRequestedLoanAmountChange,
  affordabilityResetKey,
}: FilterSidebarProps) {
  return (
    // sm:h-full + its own overflow-y-auto — this is the pane that scrolls
    // independently of the results pane next to it, once they're side by
    // side at sm: and up. Below sm: (stacked layout), it just flows with
    // the rest of the page instead — see ExplorePage.tsx's comment on why
    // an unconditional h-full breaks the stacked mobile layout. Width
    // comes from the --sidebar-pct CSS variable ExplorePage sets, which
    // the drag divider updates — defaults to 60%, user-adjustable from
    // there (sm: and up only; the divider itself is hidden below sm:).
    <aside className="flex w-full shrink-0 flex-col border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 sm:h-full sm:w-[var(--sidebar-pct)] sm:overflow-y-auto sm:border-b-0 sm:border-r">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-zinc-900 bg-zinc-50/95 px-5 py-4 backdrop-blur dark:border-zinc-100 dark:bg-zinc-950/95">
        <h2 className="flex items-center gap-2.5 text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-teal-600 px-2.5 py-0.5 text-sm font-bold text-white">{activeCount}</span>
          )}
        </h2>
        {showClear && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 rounded-full border border-teal-600 px-3 py-1 text-sm font-bold text-teal-700 hover:bg-teal-50 dark:border-teal-500 dark:text-teal-400 dark:hover:bg-teal-950/40"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 px-5 py-4">
        <FilterGroup
          title={CATEGORY_TITLES.employment_type}
          options={facets?.employment_type ?? []}
          selected={filters.employment_type}
          onToggle={onEmploymentTypeChange}
          mode="radio"
        />

        <AffordabilityForm
          key={affordabilityResetKey}
          age={filters.age}
          monthlyIncome={filters.monthly_income}
          requestedLoanAmount={requestedLoanAmount}
          onAgeChange={onAgeChange}
          onMonthlyIncomeChange={onMonthlyIncomeChange}
          onObligationsChange={onObligationsChange}
          onRequestedLoanAmountChange={onRequestedLoanAmountChange}
        />

        {CATEGORIES_AFTER_AFFORDABILITY.map((category) => (
          <FilterGroup
            key={category}
            title={CATEGORY_TITLES[category]}
            options={facets?.[category] ?? []}
            selected={filters[category]}
            onToggle={(value) => onSingleSelect(category, value)}
            subgroups={category === "property_type" ? propertyTypeGroups : undefined}
            mode="single"
          />
        ))}
      </div>
    </aside>
  );
}
