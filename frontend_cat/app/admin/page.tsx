"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ActivityLogSection } from "@/features/admin/ActivityLogSection";
import { BanksSection } from "@/features/admin/BanksSection";
import { BiasSection } from "@/features/admin/BiasSection";
import { CategoriesSection } from "@/features/admin/CategoriesSection";
import { ManageAdminsSection } from "@/features/admin/ManageAdminsSection";
import { AdminAccessRequestScreen } from "@/features/auth/AdminAccessRequestScreen";
import { AdminGrantWelcomeScreen } from "@/features/auth/AdminGrantWelcomeScreen";
import { ProfileMenu } from "@/features/auth/ProfileMenu";
import { RoleChangeBell } from "@/features/auth/RoleChangeBell";
import { useAuth } from "@/lib/useAuth";

export default function AdminDashboardPage() {
  const {
    user,
    role,
    displayName,
    orgRole,
    revoked,
    adminRequested,
    adminGrantUnseen,
    loading,
    logout,
    getToken,
    roleChangeNotice,
    dismissRoleChangeNotice,
    requestAdminAccess,
    acknowledgeAdminGrant,
  } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"banks" | "bias" | "categories" | "admins" | "log">("banks");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    // Every account gets a role (at minimum "business") the moment it signs
    // up — see business_api.py — so role ever being null here shouldn't
    // normally happen, but if it does, there's nowhere useful to send them
    // except back to log in again. A "business" role is NOT redirected
    // away anymore — it renders AdminAccessRequestScreen below instead of
    // silently bouncing to /explore.
    if (role === null) {
      router.push("/login");
    }
  }, [loading, user, role, router]);

  if (loading || !user || role === null || role === undefined) {
    return <div className="flex flex-1 items-center justify-center text-sm text-brand-500">Checking login…</div>;
  }

  if (role === "business") {
    return (
      <AdminAccessRequestScreen
        displayName={displayName}
        revoked={revoked}
        adminRequested={adminRequested}
        requestAdminAccess={requestAdminAccess}
      />
    );
  }

  if (adminGrantUnseen) {
    return <AdminGrantWelcomeScreen displayName={displayName} onContinue={acknowledgeAdminGrant} />;
  }

  return (
    <div className="flex flex-1 flex-col bg-cream-100 px-4 py-10 dark:bg-brand-950 sm:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/explore"
              className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-300 dark:hover:text-brand-100"
            >
              ← Back to the lender finder
            </Link>
            <h1 className="mt-1 text-xl font-bold text-brand-800 dark:text-cream-100">Admin</h1>
            <p className="text-sm text-brand-500 dark:text-brand-300">Logged in as {user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <RoleChangeBell notice={roleChangeNotice} onDismiss={dismissRoleChangeNotice} />
            <ProfileMenu
              email={user.email ?? ""}
              displayName={displayName}
              orgRole={orgRole}
              role={role ?? null}
              onLogout={async () => {
                await logout();
                router.push("/login");
              }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-brand-100 pb-4 dark:border-brand-600">
          <button
            onClick={() => setTab("banks")}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              tab === "banks"
                ? "bg-brand-700 text-white"
                : "text-brand-500 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-600"
            }`}
          >
            Banks
          </button>
          <button
            onClick={() => setTab("bias")}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              tab === "bias"
                ? "bg-brand-700 text-white"
                : "text-brand-500 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-600"
            }`}
          >
            Relationships
          </button>
          <button
            onClick={() => setTab("categories")}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              tab === "categories"
                ? "bg-brand-700 text-white"
                : "text-brand-500 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-600"
            }`}
          >
            Categories
          </button>
          {/* No tier above admin — every admin can manage other admins, so these two tabs are always shown here. */}
          <button
            onClick={() => setTab("admins")}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              tab === "admins"
                ? "bg-brand-700 text-white"
                : "text-brand-500 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-600"
            }`}
          >
            Manage Admins
          </button>
          <button
            onClick={() => setTab("log")}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              tab === "log"
                ? "bg-brand-700 text-white"
                : "text-brand-500 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-600"
            }`}
          >
            Activity Log
          </button>
        </div>

        {tab === "banks" ? (
          <BanksSection getToken={getToken} />
        ) : tab === "bias" ? (
          <BiasSection getToken={getToken} />
        ) : tab === "categories" ? (
          <CategoriesSection getToken={getToken} />
        ) : tab === "admins" ? (
          <ManageAdminsSection getToken={getToken} currentUserEmail={user.email} />
        ) : (
          <ActivityLogSection getToken={getToken} />
        )}
      </div>
    </div>
  );
}
