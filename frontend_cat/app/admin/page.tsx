"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AccessRequestsSection } from "@/features/admin/AccessRequestsSection";
import { ActivityLogSection } from "@/features/admin/ActivityLogSection";
import { BanksSection } from "@/features/admin/BanksSection";
import { BiasSection } from "@/features/admin/BiasSection";
import { CategoriesSection } from "@/features/admin/CategoriesSection";
import { ManageAdminsSection } from "@/features/admin/ManageAdminsSection";
import { RoleChangeBell } from "@/features/auth/RoleChangeBell";
import { useAuth } from "@/lib/useAuth";

export default function AdminDashboardPage() {
  const { user, role, loading, logout, getToken, roleChangeNotice, dismissRoleChangeNotice } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"banks" | "bias" | "categories" | "access" | "admins" | "log">("banks");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/admin/login");
      return;
    }
    // A real, logged-in account that just hasn't been approved yet — send
    // them to the waiting screen instead of a 403 wall of broken requests.
    if (role === null) {
      router.push("/admin/pending");
      return;
    }
    // A business (Explore-only) account has a real, non-null role but no
    // business being here at all — every route this page calls is
    // require_admin-gated, so without this they'd land on a half-rendered
    // dashboard full of 403 errors instead of a clean redirect.
    if (role === "business") router.push("/explore");
  }, [loading, user, role, router]);

  if (loading || !user || role === null || role === undefined || role === "business") {
    return <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">Checking login…</div>;
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-4 py-10 dark:bg-zinc-950 sm:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/explore"
              className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              ← Back to the lender finder
            </Link>
            <h1 className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-50">Admin</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Logged in as {user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <RoleChangeBell notice={roleChangeNotice} onDismiss={dismissRoleChangeNotice} />
            <button
              onClick={async () => {
                await logout();
                router.push("/admin/login");
              }}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
            >
              Log out
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <button
            onClick={() => setTab("banks")}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              tab === "banks"
                ? "bg-teal-600 text-white"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            Banks
          </button>
          <button
            onClick={() => setTab("bias")}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              tab === "bias"
                ? "bg-teal-600 text-white"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            Relationships
          </button>
          <button
            onClick={() => setTab("categories")}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              tab === "categories"
                ? "bg-teal-600 text-white"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            Categories
          </button>
          {role === "super_admin" && (
            <>
              <button
                onClick={() => setTab("access")}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                  tab === "access"
                    ? "bg-teal-600 text-white"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                Access Requests
              </button>
              <button
                onClick={() => setTab("admins")}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                  tab === "admins"
                    ? "bg-teal-600 text-white"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                Manage Admins
              </button>
              <button
                onClick={() => setTab("log")}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                  tab === "log"
                    ? "bg-teal-600 text-white"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                Activity Log
              </button>
            </>
          )}
        </div>

        {tab === "banks" ? (
          <BanksSection getToken={getToken} />
        ) : tab === "bias" ? (
          <BiasSection getToken={getToken} />
        ) : tab === "categories" ? (
          <CategoriesSection getToken={getToken} />
        ) : tab === "access" ? (
          <AccessRequestsSection getToken={getToken} />
        ) : tab === "admins" ? (
          <ManageAdminsSection getToken={getToken} currentUserEmail={user.email} />
        ) : (
          <ActivityLogSection getToken={getToken} />
        )}
      </div>
    </div>
  );
}
