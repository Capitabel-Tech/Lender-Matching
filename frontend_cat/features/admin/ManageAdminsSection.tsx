"use client";

import { useEffect, useState } from "react";

import { errorMessage } from "@/lib/api/client";
import { adminApi, type AdminAccountOut } from "@/lib/api/admin";

import { AdminLoading } from "./AdminLoading";

export function ManageAdminsSection({
  getToken,
  currentUserEmail,
}: {
  getToken: () => Promise<string | null>;
  currentUserEmail: string | null | undefined;
}) {
  const [items, setItems] = useState<AdminAccountOut[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [actingOn, setActingOn] = useState<string | null>(null);

  async function refresh() {
    const token = await getToken();
    if (!token) return;
    setItems(await adminApi.listAdmins(token));
  }

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
        const data = await adminApi.listAdmins(token);
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

  async function runAction(uid: string, action: (token: string) => Promise<unknown>) {
    setActingOn(uid);
    setListError(null);
    try {
      const token = await getToken();
      if (!token) return;
      await action(token);
      await refresh();
    } catch (err) {
      setListError(errorMessage(err));
    } finally {
      setActingOn(null);
    }
  }

  function revoke(uid: string, email: string) {
    if (!confirm(`Revoke access for ${email}? They'll be locked out immediately, even if they're using the panel right now.`)) return;
    void runAction(uid, (token) => adminApi.revokeAdminAccess(token, uid));
  }

  function dismissRequest(uid: string) {
    void runAction(uid, (token) => adminApi.dismissAdminRequest(token, uid));
  }

  // There's no tier above admin: promoting someone gives them full, equal
  // power, including editing lender data and managing (promoting/demoting/
  // revoking) every other admin, you included. The person being changed
  // picks this up on their own within ~30s (see useAuth's role polling) —
  // no need to revoke/kick them out for it to take effect. No confirm
  // dialog here — the button's own wording already says exactly what it
  // does, and "Revoke access" below is the one destructive, confirmed
  // action that actually locks someone out.
  function promote(uid: string) {
    void runAction(uid, (token) => adminApi.setAccountRole(token, uid, "admin"));
  }

  if (items === null && !listError) {
    return <AdminLoading />;
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Manage Admins</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Admins first, then business, then anyone revoked. There's no tier above admin — any admin can edit lender
          data and manage every other admin, equally. Revoking is immediate; it doesn't wait for their session to
          expire, and a revoked account can always be granted access again.
        </p>
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

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-base">
          <thead className="bg-zinc-100 text-left text-xs font-bold uppercase tracking-wide text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            <tr>
              <th className="px-5 py-4">Person</th>
              <th className="px-5 py-4">Access</th>
              <th className="px-5 py-4" />
            </tr>
          </thead>
          <tbody>
            {items?.map((admin) => {
              const isSelf = admin.email === currentUserEmail;
              const isAdmin = admin.role === "admin";
              return (
                <tr key={admin.uid} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="px-5 py-4 align-top">
                    <div className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                      {admin.display_name ?? admin.email}
                      {isSelf && <span className="ml-2 text-xs font-normal text-zinc-400">(you)</span>}
                      {admin.protected && (
                        <span
                          title="This account's access can't be revoked by anyone"
                          className="ml-2 text-xs font-normal text-zinc-400"
                        >
                          (protected)
                        </span>
                      )}
                    </div>
                    {admin.display_name && (
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">{admin.email}</div>
                    )}
                    {admin.org_role && <div className="text-sm text-zinc-500 dark:text-zinc-400">{admin.org_role}</div>}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
                        admin.revoked
                          ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                          : isAdmin
                            ? "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {admin.revoked ? "Revoked" : isAdmin ? "Admin" : "Business"}
                    </span>
                    {admin.admin_requested && (
                      <span className="ml-2 inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                        Requested admin access
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 align-top text-right">
                    {!isSelf && (
                      <div className="flex flex-wrap items-center justify-end gap-4">
                        {admin.admin_requested && (
                          <button
                            onClick={() => promote(admin.uid)}
                            disabled={actingOn === admin.uid}
                            className="text-base font-bold text-teal-600 hover:underline disabled:opacity-50 dark:text-teal-400"
                          >
                            Approve as admin
                          </button>
                        )}
                        {admin.admin_requested && (
                          <button
                            onClick={() => dismissRequest(admin.uid)}
                            disabled={actingOn === admin.uid}
                            className="text-base font-medium text-zinc-500 hover:underline disabled:opacity-50 dark:text-zinc-400"
                          >
                            Dismiss
                          </button>
                        )}
                        {!admin.admin_requested && !isAdmin && (
                          <button
                            onClick={() => promote(admin.uid)}
                            disabled={actingOn === admin.uid}
                            className="text-base font-bold text-teal-600 hover:underline disabled:opacity-50 dark:text-teal-400"
                          >
                            {admin.revoked ? "Add back as admin" : "Grant admin access"}
                          </button>
                        )}
                        {!admin.revoked && !admin.protected && (
                          <button
                            onClick={() => revoke(admin.uid, admin.email)}
                            disabled={actingOn === admin.uid}
                            className="text-base font-bold text-red-600 hover:underline disabled:opacity-50"
                          >
                            Revoke access
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {items?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-6 text-center text-zinc-400">
                  No admins yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
