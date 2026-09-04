"use client";

import { useEffect, useState } from "react";

import { errorMessage } from "@/lib/api/client";
import { adminApi, type ActivityLogEntryOut } from "@/lib/api/admin";

export function ActivityLogSection({ getToken }: { getToken: () => Promise<string | null> }) {
  const [items, setItems] = useState<ActivityLogEntryOut[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await getToken();
      if (!token || cancelled) return;
      try {
        const data = await adminApi.getActivityLog(token);
        if (!cancelled) {
          setItems(data);
          setListError(null);
        }
      } catch (err) {
        if (!cancelled) setListError(errorMessage(err));
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getToken is stable across renders, run once on mount
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Activity Log</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Every change any admin made, most recent first. Only you can see this.
        </p>
      </div>

      {listError && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <span>{listError}</span>
          <button onClick={() => setListError(null)} className="font-semibold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-base">
          <thead className="bg-zinc-50 text-left text-sm uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th className="px-5 py-3.5">When</th>
              <th className="px-5 py-3.5">Who</th>
              <th className="px-5 py-3.5">What</th>
              <th className="px-5 py-3.5">From</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((entry, i) => (
              <tr key={i} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="whitespace-nowrap px-5 py-3.5 text-zinc-500 dark:text-zinc-400">
                  {new Date(entry.created_at).toLocaleString()}
                </td>
                <td className="px-5 py-3.5 font-medium text-zinc-900 dark:text-zinc-50">{entry.actor_email}</td>
                <td className="px-5 py-3.5 text-zinc-700 dark:text-zinc-300">{entry.action}</td>
                <td className="px-5 py-3.5 text-zinc-400">{entry.ip_address ?? "—"}</td>
              </tr>
            ))}
            {items?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-center text-zinc-400">
                  No activity recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
