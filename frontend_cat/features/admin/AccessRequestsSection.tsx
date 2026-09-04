"use client";

import { useEffect, useState } from "react";

import { errorMessage } from "@/lib/api/client";
import { adminApi, type AccessRequestOut } from "@/lib/api/admin";

function formatRequestedAt(raw: string | null): string {
  if (!raw) return "—";
  const ms = Number(raw);
  if (!Number.isFinite(ms)) return "—";
  return new Date(ms).toLocaleString();
}

export function AccessRequestsSection({ getToken }: { getToken: () => Promise<string | null> }) {
  const [items, setItems] = useState<AccessRequestOut[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [actingOn, setActingOn] = useState<string | null>(null);

  async function refresh() {
    const token = await getToken();
    if (!token) return;
    setItems(await adminApi.listAccessRequests(token));
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await getToken();
      if (!token || cancelled) return;
      try {
        const data = await adminApi.listAccessRequests(token);
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

  async function approve(uid: string) {
    setActingOn(uid);
    setListError(null);
    try {
      const token = await getToken();
      if (!token) return;
      await adminApi.approveAccessRequest(token, uid);
      await refresh();
    } catch (err) {
      setListError(errorMessage(err));
    } finally {
      setActingOn(null);
    }
  }

  async function deny(uid: string, email: string) {
    if (!confirm(`Deny access for ${email}? Their account will be disabled.`)) return;
    setActingOn(uid);
    setListError(null);
    try {
      const token = await getToken();
      if (!token) return;
      await adminApi.denyAccessRequest(token, uid);
      await refresh();
    } catch (err) {
      setListError(errorMessage(err));
    } finally {
      setActingOn(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Access Requests</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Anyone who signs up at /admin/signup shows up here until you approve or deny them.
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
              <th className="px-5 py-3.5">Email</th>
              <th className="px-5 py-3.5">Requested</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {items?.map((req) => (
              <tr key={req.uid} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="px-5 py-3.5 font-medium text-zinc-900 dark:text-zinc-50">{req.email}</td>
                <td className="px-5 py-3.5 text-zinc-500 dark:text-zinc-400">{formatRequestedAt(req.requested_at)}</td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => approve(req.uid)}
                      disabled={actingOn === req.uid}
                      className="text-base font-medium text-emerald-600 hover:underline disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => deny(req.uid, req.email)}
                      disabled={actingOn === req.uid}
                      className="text-base font-medium text-red-600 hover:underline disabled:opacity-50"
                    >
                      Deny
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-6 text-center text-zinc-400">
                  No pending requests.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
