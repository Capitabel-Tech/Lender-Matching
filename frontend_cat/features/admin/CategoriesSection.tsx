"use client";

import { useState } from "react";

import { errorMessage } from "@/lib/api/client";
import { adminApi } from "@/lib/api/admin";
import { useCategories } from "@/lib/useCategories";
import type { FilterCategory } from "@/lib/api/explore";

import { AdminLoading } from "./AdminLoading";

// loan_type isn't a FilterCategory (it's admin-only, see
// backend_cat/app/explore.py's ADMIN_ONLY_CATEGORIES — no borrower-facing
// filter for it yet) but it's still managed from this same screen.
type AdminCategoryKey = FilterCategory | "loan_type";

const CATEGORY_TITLES: Record<AdminCategoryKey, string> = {
  employment_type: "Employment / Income Type",
  loan_type: "Loan Type",
  property_type: "Property Type",
  property_usage: "Property Usage",
  property_stage: "Property Stage",
  property_location: "Property Location",
};

const CATEGORY_ORDER: AdminCategoryKey[] = [
  "employment_type",
  "loan_type",
  "property_type",
  "property_usage",
  "property_stage",
  "property_location",
];

// A category value is the slug stored on every product's rules (e.g.
// "business_owner") — lowercase/underscore only, since it has to round-trip
// through the database and match exactly wherever it's compared. The label
// is the free-text display form ("Business Owner").
function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function CategoriesSection({ getToken }: { getToken: () => Promise<string | null> }) {
  const [categories, refetch, categoriesError] = useCategories(getToken);
  const [addingTo, setAddingTo] = useState<AdminCategoryKey | null>(null);
  const [labelInput, setLabelInput] = useState("");
  const [groupInput, setGroupInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!categories && categoriesError) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
        <span>{categoriesError}</span>
        <button onClick={refetch} className="font-semibold hover:underline">
          Retry
        </button>
      </div>
    );
  }

  if (!categories) {
    return <AdminLoading />;
  }

  const groupHeadings = [...new Set(categories.property_type_groups.map((g) => g.heading))];

  function startAdd(category: AdminCategoryKey) {
    setAddingTo(category);
    setLabelInput("");
    setGroupInput(groupHeadings[0] ?? "");
    setError(null);
  }

  async function submitAdd() {
    if (!addingTo) return;
    const label = labelInput.trim();
    if (!label) {
      setError("Enter a name.");
      return;
    }
    const value = slugify(label);
    if (!value) {
      setError("That name doesn't produce a usable value — try letters or numbers.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const token = await getToken();
      if (!token) return;
      await adminApi.addCategoryOption(token, addingTo, {
        value,
        label,
        group_heading: addingTo === "property_type" ? groupInput || null : null,
      });
      setAddingTo(null);
      refetch();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(category: AdminCategoryKey, value: string, label: string) {
    if (!confirm(`Remove "${label}" from ${CATEGORY_TITLES[category]}? Existing products that use it keep the raw value.`))
      return;
    setError(null);
    try {
      const token = await getToken();
      if (!token) return;
      await adminApi.deleteCategoryOption(token, category, value);
      refetch();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold text-brand-800 dark:text-cream-100">Manage categories</h2>
        <p className="mt-1 text-sm text-brand-500 dark:text-brand-300">
          Add or remove the values a bank product can be tagged with — new ones show up in every bank's edit form and
          the borrower-facing filters immediately, no code change needed.
        </p>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-semibold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {CATEGORY_ORDER.map((category) => (
          <div
            key={category}
            className="flex flex-col gap-3 rounded-2xl border border-brand-100 bg-white p-5 dark:border-brand-600 dark:bg-brand-800"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-brand-800 dark:text-cream-100">{CATEGORY_TITLES[category]}</h3>
              <button
                onClick={() => startAdd(category)}
                className="text-sm font-bold text-brand-700 hover:underline"
              >
                + Add value
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories[category].map((option) => (
                <span
                  key={option.value}
                  className="flex items-center gap-2 rounded-full border border-brand-200 bg-cream-100 px-3.5 py-2 text-sm font-bold text-brand-600 dark:border-brand-600 dark:bg-brand-950 dark:text-brand-100"
                >
                  {option.label}
                  <button
                    onClick={() => remove(category, option.value, option.label)}
                    className="text-red-500 hover:text-red-700"
                    aria-label={`Remove ${option.label}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              {categories[category].length === 0 && <span className="text-sm text-brand-300">No values yet.</span>}
            </div>

            {addingTo === category && (
              <div className="flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-brand-200 p-3 dark:border-brand-600">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-brand-500 dark:text-brand-200">Name</label>
                  <input
                    autoFocus
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    placeholder="e.g. Business Owner"
                    className="rounded-lg border border-brand-200 px-3 py-1.5 text-sm dark:border-brand-600 dark:bg-brand-950"
                  />
                </div>
                {category === "property_type" && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-brand-500 dark:text-brand-200">Group</label>
                    <select
                      value={groupInput}
                      onChange={(e) => setGroupInput(e.target.value)}
                      className="rounded-lg border border-brand-200 px-3 py-1.5 text-sm dark:border-brand-600 dark:bg-brand-950"
                    >
                      {groupHeadings.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <button
                  onClick={submitAdd}
                  disabled={busy}
                  className="rounded-lg bg-brand-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
                >
                  {busy ? "Adding…" : "Add"}
                </button>
                <button
                  onClick={() => setAddingTo(null)}
                  className="rounded-lg border border-brand-200 px-4 py-1.5 text-sm font-semibold text-brand-600 dark:border-brand-600 dark:text-brand-100"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
