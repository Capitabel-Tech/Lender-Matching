"use client";

import { useAuth } from "@/lib/useAuth";

import { RoleChangeBell } from "./RoleChangeBell";

// Thin wrapper so a Server Component page (e.g. app/explore/page.tsx) can
// drop the bell into its header without itself needing to be a client
// component just to call useAuth().
export function HeaderBell() {
  const { roleChangeNotice, dismissRoleChangeNotice } = useAuth();
  return <RoleChangeBell notice={roleChangeNotice} onDismiss={dismissRoleChangeNotice} />;
}
