"use client";

import { useEffect, useState } from "react";

import { errorMessage } from "@/lib/api/client";
import { adminApi, type AdminBiasOut } from "@/lib/api/admin";

import { AdminLoading } from "./AdminLoading";

export function BiasSection({ getToken }: { getToken: () => Promise<string | null> }) {
  const [items, setItems] = useState<AdminBiasOut[] | null>(null);
  const [editingBank, setEditingBank] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [form, setForm] = useState({ bank_name: "", recent_borrowers_processed: 0, relationship_note: "" });
  const [error, setError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  async function refresh() {
    const token = await getToken();
    if (!token) return;
    setItems(await adminApi.listBias(token));
  }

  useEffect(() => {
    let cancelled = false;
    let retryTimer: number | undefined;

    async function load(attempt = 0) {
      try {
        const token = await getToken();
        // getToken only returns null in the moment right after login before
        // Firebase's own state has settled — retry shortly instead of
        // silently leaving `items` at null forever with no feedback at all.
        if (!token) {
          if (!cancelled) retryTimer = window.setTimeout(() => load(attempt), 300);
          return;
        }
        const data = await adminApi.listBias(token);
        if (!cancelled) {
          setItems(data);
          setListError(null);
        }
      } catch (err) {
        // A transient Firebase hiccup (e.g. "Database is closing" if the
        // tab was backgrounded) is common enough to deserve one silent
        // retry before bothering the user with an error banner.
        if (attempt === 0) {
          if (!cancelled) retryTimer = window.setTimeout(() => load(1), 500);
          return;
        }
        if (!cancelled) setListError(errorMessage(err));
      }
    }

    void load();
    return () => {
      cancelled = true;
      window.clearTimeout(retryTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getToken is stable across renders, run once on mount
  }, [retryKey]);

  function startEdit(item: AdminBiasOut) {
    setEditingBank(item.bank_name);
    setAddingNew(false);
    setForm({ ...item });
    setError(null);
  }

  function startAdd() {
    setAddingNew(true);
    setEditingBank(null);
    setForm({ bank_name: "", recent_borrowers_processed: 0, relationship_note: "" });
    setError(null);
  }

  async function save() {
    if (!form.bank_name.trim()) {
      setError("Enter a bank name.");
      return;
    }
    setError(null);
    try {
      const token = await getToken();
      if (!token) return;
      await adminApi.upsertBias(token, form.bank_name.trim(), {
        recent_borrowers_processed: form.recent_borrowers_processed,
        relationship_note: form.relationship_note,
      });
      setEditingBank(null);
      setAddingNew(false);
      await refresh();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function remove(bankName: string) {
    if (!confirm(`Remove relationship data for ${bankName}? It goes back to having none at all.`)) return;
    setListError(null);
    try {
      const token = await getToken();
      if (!token) return;
      await adminApi.deleteBias(token, bankName);
      await refresh();
    } catch (err) {
      setListError(errorMessage(err));
    }
  }

  const isEditingOrAdding = editingBank !== null || addingNew;

  if (items === null && !listError) {
    return <AdminLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-brand-800 dark:text-cream-100">Relationships</h2>
        {!isEditingOrAdding && (
          <button
            onClick={startAdd}
            className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
          >
            + Add relationship data
          </button>
        )}
      </div>

      {isEditingOrAdding ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-brand-100 bg-white p-6 dark:border-brand-600 dark:bg-brand-800">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-brand-600 dark:text-brand-200">Bank name</label>
            <input
              disabled={editingBank !== null}
              value={form.bank_name}
              onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
              className="rounded-lg border border-brand-200 px-3 py-2 text-sm disabled:bg-brand-50 dark:border-brand-600 dark:bg-brand-950 dark:disabled:bg-brand-600"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-brand-600 dark:text-brand-200">
              Borrowers placed recently (higher = ranked higher, always above banks with none)
            </label>
            <input
              type="number"
              min={0}
              value={form.recent_borrowers_processed}
              onChange={(e) => setForm({ ...form, recent_borrowers_processed: Number(e.target.value) })}
              className="rounded-lg border border-brand-200 px-3 py-2 text-sm dark:border-brand-600 dark:bg-brand-950"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-brand-600 dark:text-brand-200">Note (shown to borrowers)</label>
            <input
              value={form.relationship_note}
              onChange={(e) => setForm({ ...form, relationship_note: e.target.value })}
              className="rounded-lg border border-brand-200 px-3 py-2 text-sm dark:border-brand-600 dark:bg-brand-950"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={save}
              className="rounded-lg bg-brand-700 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-800"
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditingBank(null);
                setAddingNew(false);
              }}
              className="rounded-lg border border-brand-200 px-5 py-2 text-sm font-semibold text-brand-600 dark:border-brand-600 dark:text-brand-100"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {listError && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              <span>{listError}</span>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  onClick={() => {
                    setListError(null);
                    setItems(null);
                    setRetryKey((k) => k + 1);
                  }}
                  className="font-semibold hover:underline"
                >
                  Retry
                </button>
                <button onClick={() => setListError(null)} className="font-semibold hover:underline">
                  Dismiss
                </button>
              </div>
            </div>
          )}
        <div className="overflow-x-auto rounded-2xl border border-brand-100 dark:border-brand-600">
          <table className="w-full text-base">
            <thead className="bg-cream-100 text-left text-sm uppercase tracking-wide text-brand-500 dark:bg-brand-800 dark:text-brand-300">
              <tr>
                <th className="px-5 py-3.5">Bank name</th>
                <th className="px-5 py-3.5">Borrowers placed recently</th>
                <th className="px-5 py-3.5">Note</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {items?.map((item) => (
                <tr key={item.bank_name} className="border-t border-brand-50 dark:border-brand-600">
                  <td className="px-5 py-3.5 font-medium text-brand-800 dark:text-cream-100">{item.bank_name}</td>
                  <td className="px-5 py-3.5 text-brand-500 dark:text-brand-300">{item.recent_borrowers_processed}</td>
                  <td className="px-5 py-3.5 text-brand-500 dark:text-brand-300">{item.relationship_note}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => startEdit(item)} className="text-base font-medium text-brand-700 hover:underline">
                        Edit
                      </button>
                      <button onClick={() => remove(item.bank_name)} className="text-base font-medium text-red-600 hover:underline">
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-brand-300">
                    No relationship data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
}
