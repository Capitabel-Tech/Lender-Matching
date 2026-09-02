"use client";

import { useEffect, useState } from "react";

import { errorMessage } from "@/lib/api/client";
import { adminApi, type AdminBankSummary, type AdminProductDetail, type AdminProductOut } from "@/lib/api/admin";
import { useCategories } from "@/lib/useCategories";

import { BankNameCombobox } from "./BankNameCombobox";
import { ProductDetailForm } from "./ProductDetailForm";

type View =
  | { name: "list" }
  | { name: "bank"; bankName: string } // shows loan-type cards (Home Loan, Education Loan, ...)
  | { name: "loan-type"; bankName: string; loanType: string } // shows employment-type product cards within one loan type
  // isNewBank marks the case where this bank hasn't actually been created
  // yet — reached via "+ Add new bank" for a name that doesn't exist. Cancel
  // needs this to know whether there's a real "bank" screen to fall back to.
  | { name: "add-loan-type"; bankName: string; isNewBank: boolean }
  | { name: "add-product"; bankName: string; loanType: string }
  | { name: "edit"; bankName: string; product: AdminProductOut }
  | { name: "add-new-bank" };

export function BanksSection({ getToken }: { getToken: () => Promise<string | null> }) {
  const [categories] = useCategories();
  const [view, setView] = useState<View>({ name: "list" });
  const [banks, setBanks] = useState<AdminBankSummary[] | null>(null);
  const [bankProducts, setBankProducts] = useState<AdminProductOut[] | null>(null);
  const [newBankName, setNewBankName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function refreshBankProducts(bankName: string) {
    const token = await getToken();
    if (!token) return;
    setBankProducts(await adminApi.getBankProducts(token, bankName));
  }

  // "list", "bank" and "loan-type" all need bankProducts loaded — "add-*"
  // states are reached both for banks that already exist AND ones that
  // don't exist yet (mid-creation), so fetching products for them here
  // would 404 and crash for the "doesn't exist yet" case, which is a
  // completely normal state, not an error.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const token = await getToken();
      if (!token || cancelled) return;
      try {
        if (view.name === "list") {
          const data = await adminApi.listBanks(token);
          if (!cancelled) setBanks(data);
        } else if (view.name === "bank" || view.name === "loan-type") {
          const data = await adminApi.getBankProducts(token, view.bankName);
          if (cancelled) return;
          setBankProducts(data);
          // Only one loan type exists anywhere (see the Categories tab) —
          // there's nothing meaningful to choose between, so skip straight
          // to it instead of making the admin click through an extra screen
          // that only ever has one option on it. Keyed off the global
          // category list, not this bank's own products, so a bank with
          // zero products yet still gets the real picker once a second loan
          // type (e.g. Education Loan) exists for anyone to add.
          if (view.name === "bank" && categories && categories.loan_type.length <= 1) {
            const loanType = categories.loan_type[0]?.value ?? "home_loan";
            setView({ name: "loan-type", bankName: view.bankName, loanType });
            return;
          }
        }
        if (!cancelled) setError(null);
      } catch (err) {
        if (!cancelled) setError(errorMessage(err));
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getToken is stable across renders
  }, [view]);

  async function handleCreate(bankName: string, loanType: string, detail: AdminProductDetail) {
    const token = await getToken();
    if (!token) return;
    await adminApi.createBankProduct(token, bankName, detail);
    setView({ name: "loan-type", bankName, loanType });
  }

  async function handleUpdate(bankName: string, loanType: string, employmentType: string, detail: AdminProductDetail) {
    const token = await getToken();
    if (!token) return;
    await adminApi.updateBankProduct(token, bankName, loanType, employmentType, detail);
    setView({ name: "loan-type", bankName, loanType });
  }

  async function handleDeleteProduct(bankName: string, loanType: string, employmentType: string) {
    if (!confirm(`Remove the ${employmentType} product from ${bankName}?`)) return;
    setError(null);
    try {
      const token = await getToken();
      if (!token) return;
      await adminApi.deleteBankProduct(token, bankName, loanType, employmentType);
      await refreshBankProducts(bankName);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function handleDeleteBank(bankName: string) {
    if (!confirm(`Delete ${bankName} entirely, including all its products?`)) return;
    setError(null);
    try {
      const token = await getToken();
      if (!token) return;
      await adminApi.deleteBank(token, bankName);
      setView({ name: "list" });
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function handleAddNewBankSubmit() {
    setError(null);
    if (!newBankName.trim()) {
      setError("Enter a bank name.");
      return;
    }
    const token = await getToken();
    if (!token) return;
    try {
      const products = await adminApi.getBankProducts(token, newBankName.trim());
      // Bank already exists — go manage it instead of creating a duplicate.
      setBankProducts(products);
      setView({ name: "bank", bankName: newBankName.trim() });
    } catch {
      // Doesn't exist yet — go straight to the "add a loan type" form. This
      // is the expected, normal path for a genuinely new bank name, not a
      // failure. Reset bankProducts so the dropdowns don't accidentally
      // inherit a stale, unrelated bank's product list.
      setBankProducts([]);
      setView({ name: "add-loan-type", bankName: newBankName.trim(), isNewBank: true });
    }
  }

  const loanLabelFor = (value: string) => categories?.loan_type.find((t) => t.value === value)?.label ?? value;
  const employmentLabelFor = (value: string) => categories?.employment_type.find((t) => t.value === value)?.label ?? value;

  if (!categories) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>;
  }

  const errorBanner = error && (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
      <span>{error}</span>
      <button onClick={() => setError(null)} className="font-semibold hover:underline">
        Dismiss
      </button>
    </div>
  );

  if (view.name === "list") {
    const filteredBanks = banks?.filter((bank) =>
      bank.bank_name.toLowerCase().includes(search.trim().toLowerCase()),
    );
    return (
      <div className="flex flex-col gap-4">
        {errorBanner}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Banks</h2>
          <button
            onClick={() => {
              setNewBankName("");
              setError(null);
              setView({ name: "add-new-bank" });
            }}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-base font-semibold text-white hover:bg-emerald-700"
          >
            + Add new bank
          </button>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search banks by name…"
          className="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-base outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950"
        />

        <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-base">
            <thead className="bg-zinc-50 text-left text-sm uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-5 py-3.5">Bank name</th>
                <th className="px-5 py-3.5">Source</th>
                <th className="px-5 py-3.5">Products (employment types)</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {filteredBanks?.map((bank) => (
                <tr key={bank.bank_name} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="px-5 py-3.5 font-medium text-zinc-900 dark:text-zinc-50">{bank.bank_name}</td>
                  <td className="px-5 py-3.5 text-zinc-500 dark:text-zinc-400">{bank.source}</td>
                  <td className="px-5 py-3.5 text-zinc-500 dark:text-zinc-400">
                    {bank.employment_types.map(employmentLabelFor).join(", ") || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => {
                        setError(null);
                        setView({ name: "bank", bankName: bank.bank_name });
                      }}
                      className="text-base font-medium text-emerald-600 hover:underline"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
              {filteredBanks?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-zinc-400">
                    No banks match &ldquo;{search}&rdquo;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (view.name === "add-new-bank") {
    return (
      <div className="flex flex-col gap-4">
        <button onClick={() => setView({ name: "list" })} className="w-fit text-sm text-zinc-500 hover:underline">
          ← Back to banks
        </button>
        <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Bank name</label>
          <BankNameCombobox value={newBankName} onChange={setNewBankName} getToken={getToken} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            onClick={handleAddNewBankSubmit}
            className="w-fit rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (view.name === "bank") {
    return (
      <div className="flex flex-col gap-4">
        <button onClick={() => setView({ name: "list" })} className="w-fit text-sm text-zinc-500 hover:underline">
          ← Back to banks
        </button>
        {errorBanner}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{view.bankName}</h3>
          <button
            onClick={() => handleDeleteBank(view.bankName)}
            className="text-sm font-medium text-red-600 hover:underline"
          >
            Delete this bank
          </button>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Select the loan type to view or update its details.</p>
        <div className="flex flex-col gap-3">
          {categories.loan_type.map(({ value: loanType }) => {
            const count = bankProducts?.filter((p) => p.loan_type === loanType).length ?? 0;
            return (
              <div
                key={loanType}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{loanLabelFor(loanType)}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {count === 0 ? "No employment types yet" : `${count} employment type${count === 1 ? "" : "s"}`}
                  </p>
                </div>
                <button
                  onClick={() => setView({ name: "loan-type", bankName: view.bankName, loanType })}
                  className="text-sm font-medium text-emerald-600 hover:underline"
                >
                  Manage
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (view.name === "loan-type") {
    const productsInLoanType = bankProducts?.filter((p) => p.loan_type === view.loanType) ?? [];
    const missingEmploymentTypes = categories.employment_type.filter(
      (t) => !productsInLoanType.some((p) => p.employment_type === t.value),
    );
    // Going "back" to a single-loan-type selection screen would just
    // auto-skip forward again (see the effect above) — go all the way back
    // to the bank list instead so the button actually does something.
    const onlyOneLoanType = categories.loan_type.length <= 1;
    const goBack = () => setView(onlyOneLoanType ? { name: "list" } : { name: "bank", bankName: view.bankName });
    return (
      <div className="flex flex-col gap-4">
        <button onClick={goBack} className="w-fit text-sm text-zinc-500 hover:underline">
          ← Back to {onlyOneLoanType ? "banks" : view.bankName}
        </button>
        {errorBanner}
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          {view.bankName} — {loanLabelFor(view.loanType)}
        </h3>
        <div className="flex flex-col gap-3">
          {productsInLoanType.map((product) => (
            <div
              key={product.employment_type}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {employmentLabelFor(product.employment_type)}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Rate {product.interest_rate_pct}%
                  {product.interest_rate_upper_pct ? `–${product.interest_rate_upper_pct}%` : ""} · FOIR{" "}
                  {product.foir_pct ?? "—"}% · Tenure {product.max_tenure_years ?? "—"} yrs
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setView({ name: "edit", bankName: view.bankName, product })}
                  className="text-sm font-medium text-emerald-600 hover:underline"
                >
                  View / Edit
                </button>
                <button
                  onClick={() => handleDeleteProduct(view.bankName, view.loanType, product.employment_type)}
                  className="text-sm font-medium text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {productsInLoanType.length === 0 && (
            <p className="rounded-xl border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-400 dark:border-zinc-700">
              No employment types under {loanLabelFor(view.loanType)} yet.
            </p>
          )}
        </div>
        {missingEmploymentTypes.length > 0 && (
          <button
            onClick={() => setView({ name: "add-product", bankName: view.bankName, loanType: view.loanType })}
            className="w-fit rounded-lg border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          >
            + Add another employment type
          </button>
        )}
      </div>
    );
  }

  if (view.name === "add-loan-type") {
    // A genuinely new bank doesn't exist until the first product is
    // actually submitted — "Continue" only checked the name, it never
    // created anything — so there's no real "bank" screen to go back to
    // yet. Route back to the bank list instead of a lookup that will 404.
    const goBack = () => setView(view.isNewBank ? { name: "list" } : { name: "bank", bankName: view.bankName });
    return (
      <div className="flex flex-col gap-4">
        <button onClick={goBack} className="w-fit text-sm text-zinc-500 hover:underline">
          ← Back
        </button>
        {errorBanner}
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Add a loan type for {view.bankName}</h3>
        <ProductDetailForm
          categories={categories}
          submitLabel="Add product"
          onCancel={goBack}
          onSubmit={(detail) => handleCreate(view.bankName, detail.loan_type, detail)}
        />
      </div>
    );
  }

  if (view.name === "add-product") {
    const goBack = () => setView({ name: "loan-type", bankName: view.bankName, loanType: view.loanType });
    const productsInLoanType = bankProducts?.filter((p) => p.loan_type === view.loanType) ?? [];
    const missingEmploymentTypes = categories.employment_type.filter(
      (t) => !productsInLoanType.some((p) => p.employment_type === t.value),
    );
    return (
      <div className="flex flex-col gap-4">
        <button onClick={goBack} className="w-fit text-sm text-zinc-500 hover:underline">
          ← Back
        </button>
        {errorBanner}
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Add an employment type under {loanLabelFor(view.loanType)} for {view.bankName}
        </h3>
        <ProductDetailForm
          categories={categories}
          submitLabel="Add product"
          lockLoanType
          loanTypeOptions={[{ value: view.loanType, label: loanLabelFor(view.loanType) }]}
          employmentTypeOptions={missingEmploymentTypes}
          onCancel={goBack}
          onSubmit={(detail) => handleCreate(view.bankName, view.loanType, detail)}
        />
      </div>
    );
  }

  if (view.name === "edit") {
    const goBack = () => setView({ name: "loan-type", bankName: view.bankName, loanType: view.product.loan_type });
    return (
      <div className="flex flex-col gap-4">
        <button onClick={goBack} className="w-fit text-sm text-zinc-500 hover:underline">
          ← Back to {loanLabelFor(view.product.loan_type)}
        </button>
        {errorBanner}
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          {view.bankName} — {loanLabelFor(view.product.loan_type)} — {employmentLabelFor(view.product.employment_type)}
        </h3>
        <ProductDetailForm
          categories={categories}
          initial={view.product}
          lockEmploymentType
          lockLoanType
          submitLabel="Save changes"
          onCancel={goBack}
          onSubmit={(detail) => handleUpdate(view.bankName, view.product.loan_type, view.product.employment_type, detail)}
        />
      </div>
    );
  }

  return null;
}
