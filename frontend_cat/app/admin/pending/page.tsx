"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/lib/useAuth";

export default function AdminPendingPage() {
  const { user, role, loading, logout, refreshStatus } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/admin/login");
      return;
    }
    if (role === "admin" || role === "super_admin") {
      router.push("/admin");
    }
  }, [loading, user, role, router]);

  async function checkAgain() {
    setChecking(true);
    await refreshStatus();
    setChecking(false);
  }

  if (loading || !user || role === "admin" || role === "super_admin") {
    return <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">Checking…</div>;
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 px-4 py-16 text-center dark:bg-zinc-950">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </span>
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Waiting for approval</h1>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            Signed in as <span className="font-medium text-zinc-700 dark:text-zinc-300">{user.email}</span>. A super
            admin needs to approve your access request before you can get into the admin panel.
          </p>
        </div>
        <button
          onClick={checkAgain}
          disabled={checking}
          className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {checking ? "Checking…" : "Check again"}
        </button>
        <button
          onClick={async () => {
            await logout();
            router.push("/admin/login");
          }}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
