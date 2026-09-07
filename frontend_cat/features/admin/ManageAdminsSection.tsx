"use client";

import { useEffect, useState } from "react";

import { errorMessage } from "@/lib/api/client";
import { adminApi, type AdminAccountOut } from "@/lib/api/admin";

function roleLabel(role: "business" | "admin" | "super_admin"): string {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "admin":
      return "Admin";
    case "business":
      return "Business";
  }
}

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await getToken();
      if (!token || cancelled) return;
      try {
        const data = await adminApi.listAdmins(token);
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

  async function revoke(uid: string, email: string) {
    if (!confirm(`Revoke access for ${email}? They'll be locked out immediately, even if they're using the panel right now.`)) return;
    setActingOn(uid);
    setListError(null);
    try {
      const token = await getToken();
      if (!token) return;
      await adminApi.revokeAdminAccess(token, uid);
      await refresh();
    } catch (err) {
      setListError(errorMessage(err));
    } finally {
      setActingOn(null);
    }
  }

  // Promotes or demotes between business/admin/super_admin — e.g. turning
  // a business (Explore-only) account into a full admin. The person being
  // changed picks this up on their own within ~30s (see useAuth's role
  // polling) — no need to revoke/kick them out for it to take effect.
  async function changeRole(uid: string, email: string, newRole: "business" | "admin" | "super_admin") {
    if (newRole === "super_admin" && !confirm(`Make ${email} a super admin? They'll have full access, equal to you.`)) {
      return;
    }
    setActingOn(uid);
    setListError(null);
    try {
      const token = await getToken();
      if (!token) return;
      await adminApi.setAccountRole(token, uid, newRole);
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
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Manage Admins</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Everyone who currently has access — business (Explore-only), admin, and super admin. Change someone's role
          with the dropdown, or revoke access entirely; revoking is immediate — it doesn't wait for their session to
          expire.
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
              <th className="px-5 py-3.5">Role</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {items?.map((admin) => {
              const isSelf = admin.email === currentUserEmail;
              return (
                <tr key={admin.uid} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="px-5 py-3.5 font-medium text-zinc-900 dark:text-zinc-50">
                    {admin.email}
                    {isSelf && <span className="ml-2 text-xs font-normal text-zinc-400">(you)</span>}
                  </td>
                  <td className="px-5 py-3.5 text-zinc-500 dark:text-zinc-400">
                    {isSelf ? (
                      roleLabel(admin.role)
                    ) : (
                      <select
                        value={admin.role}
                        disabled={actingOn === admin.uid}
                        onChange={(e) =>
                          changeRole(admin.uid, admin.email, e.target.value as "business" | "admin" | "super_admin")
                        }
                        className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm outline-none focus:border-teal-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950"
                      >
                        <option value="business">{roleLabel("business")}</option>
                        <option value="admin">{roleLabel("admin")}</option>
                        <option value="super_admin">{roleLabel("super_admin")}</option>
                      </select>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {!isSelf && (
                      <button
                        onClick={() => revoke(admin.uid, admin.email)}
                        disabled={actingOn === admin.uid}
                        className="text-base font-medium text-red-600 hover:underline disabled:opacity-50"
                      >
                        Revoke access
                      </button>
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
