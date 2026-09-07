"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/lib/useAuth";

// Wraps any page that now requires a logged-in business/admin/super_admin
// account (Explore Lenders and the landing page both do — see
// backend_cat/app/auth.py's require_any_role). Anyone without a real,
// assigned role gets bounced to /login before seeing anything.
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user || !role) router.push("/login");
  }, [loading, user, role, router]);

  if (loading || !user || !role) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#050B12] text-sm text-[#91A0AE]">Checking…</div>
    );
  }

  return <>{children}</>;
}
