"use client";

import { useState } from "react";

import { errorMessage } from "@/lib/api/client";
import type { AdminProductDetail } from "@/lib/api/admin";
import type { CategoriesResponse } from "@/lib/api/explore";

type ListField = "property_type" | "property_usage" | "property_stage" | "property_location";

const EMPTY: AdminProductDetail = {
  employment_type: "",
  loan_type: "home_loan",
  property_type: [],
  property_usage: [],
  property_stage: [],
  property_location: [],
  foir_pct: null,
  max_tenure_years: null,
  interest_rate_pct: 0,
  interest_rate_upper_pct: null,
  interest_rate_is_estimated: false,
};

function PillGroup({
  options,
  selected,
  onToggle,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(({ value, label }) => (
        <button
          type="button"
          key={value}
          onClick={() => onToggle(value)}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
            selected.includes(value)
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function ProductDetailForm({
  categories,
  initial,
  lockEmploymentType,
  employmentTypeOptions,
  lockLoanType,
  loanTypeOptions,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  // The current, real set of allowed values per category — fetched via
  // lib/useCategories, not hardcoded, so a value an admin just added
  // through "Manage categories" is pickable here immediately.
  categories: CategoriesResponse;
  initial?: AdminProductDetail;
  lockEmploymentType?: boolean;
  // Restricts the dropdown to employment types this bank doesn't already
  // have a product for — so adding a new one can't collide with an existing
  // product by accident.
  employmentTypeOptions?: { value: string; label: string }[];
  lockLoanType?: boolean;
  // Restricts the dropdown to loan types this bank doesn't already have, for
  // the same reason as employmentTypeOptions above.
  loanTypeOptions?: { value: string; label: string }[];
  onSubmit: (detail: AdminProductDetail) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [detail, setDetail] = useState<AdminProductDetail>(
    initial ?? {
      ...EMPTY,
      employment_type: (employmentTypeOptions ?? categories.employment_type)[0]?.value ?? "",
      loan_type: (loanTypeOptions ?? categories.loan_type)[0]?.value ?? "home_loan",
    },
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const employmentOptions = employmentTypeOptions ?? categories.employment_type;
  const loanOptions = loanTypeOptions ?? categories.loan_type;

  function toggle(field: ListField, value: string) {
    const current = detail[field];
    setDetail({
      ...detail,
      [field]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!detail.loan_type) {
      setError("Select a loan type.");
      return;
    }
    if (!detail.employment_type) {
      setError("Select an employment type.");
      return;
    }
    for (const field of ["property_type", "property_usage", "property_stage", "property_location"] as ListField[]) {
      if (detail[field].length === 0) {
        setError(`Pick at least one ${field.replace("property_", "").replace("_", " ")}.`);
        return;
      }
    }
    if (!detail.interest_rate_pct || detail.interest_rate_pct <= 0) {
      setError("Interest rate must be greater than 0.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSubmit(detail);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Loan type</label>
        <select
          disabled={lockLoanType}
          value={detail.loan_type}
          onChange={(e) => setDetail({ ...detail, loan_type: e.target.value })}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:disabled:bg-zinc-800"
        >
          {loanOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Employment type</label>
        <select
          disabled={lockEmploymentType}
          value={detail.employment_type}
          onChange={(e) => setDetail({ ...detail, employment_type: e.target.value })}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:disabled:bg-zinc-800"
        >
          {employmentOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Interest rate (%)</label>
          <input
            type="number"
            step="0.01"
            required
            placeholder="e.g. 7.25"
            value={detail.interest_rate_pct || ""}
            onChange={(e) => setDetail({ ...detail, interest_rate_pct: Number(e.target.value) })}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Upper rate (%)</label>
          <input
            type="number"
            step="0.01"
            placeholder="optional"
            value={detail.interest_rate_upper_pct ?? ""}
            onChange={(e) =>
              setDetail({ ...detail, interest_rate_upper_pct: e.target.value === "" ? null : Number(e.target.value) })
            }
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">FOIR (%)</label>
          <input
            type="number"
            step="0.01"
            placeholder="e.g. 58"
            value={detail.foir_pct ?? ""}
            onChange={(e) => setDetail({ ...detail, foir_pct: e.target.value === "" ? null : Number(e.target.value) })}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Max tenure (yrs)</label>
          <input
            type="number"
            step="0.5"
            placeholder="e.g. 30"
            value={detail.max_tenure_years ?? ""}
            onChange={(e) =>
              setDetail({ ...detail, max_tenure_years: e.target.value === "" ? null : Number(e.target.value) })
            }
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
      </div>

      <label className="flex w-fit items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <input
          type="checkbox"
          checked={detail.interest_rate_is_estimated}
          onChange={(e) => setDetail({ ...detail, interest_rate_is_estimated: e.target.checked })}
        />
        Rate is an estimate (not confirmed with the bank)
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Property type accepted</span>
        {categories.property_type_groups.map((g) => (
          <div key={g.heading} className="flex flex-col gap-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">{g.heading}</p>
            <PillGroup
              options={g.values.map((value) => ({
                value,
                label: categories.property_type.find((o) => o.value === value)?.label ?? value,
              }))}
              selected={detail.property_type}
              onToggle={(v) => toggle("property_type", v)}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Property usage accepted</span>
        <PillGroup options={categories.property_usage} selected={detail.property_usage} onToggle={(v) => toggle("property_usage", v)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Property stage accepted</span>
        <PillGroup options={categories.property_stage} selected={detail.property_stage} onToggle={(v) => toggle("property_stage", v)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Property location accepted</span>
        <PillGroup
          options={categories.property_location}
          selected={detail.property_location}
          onToggle={(v) => toggle("property_location", v)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
