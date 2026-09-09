"use client";

import { useEffect, useState } from "react";

import { errorMessage } from "@/lib/api/client";
import { adminApi, type ActivityLogEntryOut } from "@/lib/api/admin";

import { AdminLoading } from "./AdminLoading";

export function ActivityLogSection({ getToken }: { getToken: () => Promise<string | null> }) {
  const [items, setItems] = useState<ActivityLogEntryOut[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [retryKey, setRetryKey] = useState(0);

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
        const data = await adminApi.getActivityLog(token);
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

  if (items === null && !listError) {
    return <AdminLoading />;
  }

  // Deliberately only email, name, and date — not the free-text action
  // column, which pulled in unrelated rows any time the search term
  // happened to appear somewhere in that sentence (e.g. searching "admin"
  // matched nearly every row regardless of who was involved).
  const query = search.trim().toLowerCase();
  const filteredItems = query
    ? items?.filter((entry) => {
        const dateText = new Date(entry.created_at).toLocaleString().toLowerCase();
        return (
          entry.actor_email.toLowerCase().includes(query) ||
          (entry.actor_name?.toLowerCase().includes(query) ?? false) ||
          dateText.includes(query)
        );
      })
    : items;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-brand-800 dark:text-cream-100">Activity Log</h2>
          <p className="text-sm text-brand-500 dark:text-brand-300">
            Every change any admin made, most recent first. Only you can see this.
          </p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or date…"
          className="w-64 shrink-0 rounded-lg border border-brand-200 px-3.5 py-2 text-sm outline-none focus:border-brand-500 dark:border-brand-600 dark:bg-brand-950"
        />
      </div>

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
              <th className="px-5 py-3.5">When</th>
              <th className="px-5 py-3.5">Name</th>
              <th className="px-5 py-3.5">Who</th>
              <th className="px-5 py-3.5">What</th>
              <th className="px-5 py-3.5">From</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems?.map((entry, i) => (
              <tr key={i} className="border-t border-brand-50 dark:border-brand-600">
                <td className="whitespace-nowrap px-5 py-3.5 text-brand-500 dark:text-brand-300">
                  {new Date(entry.created_at).toLocaleString()}
                </td>
                <td className="px-5 py-3.5 font-medium text-brand-800 dark:text-cream-100">
                  {entry.actor_name ?? "—"}
                </td>
                <td className="px-5 py-3.5 text-brand-500 dark:text-brand-300">{entry.actor_email}</td>
                <td className="px-5 py-3.5 text-brand-600 dark:text-brand-200">{entry.action}</td>
                <td className="px-5 py-3.5 text-brand-300">{entry.ip_address ?? "—"}</td>
              </tr>
            ))}
            {items?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-brand-300">
                  No activity recorded yet.
                </td>
              </tr>
            )}
            {items && items.length > 0 && filteredItems?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-brand-300">
                  No activity matches &ldquo;{search.trim()}&rdquo;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
