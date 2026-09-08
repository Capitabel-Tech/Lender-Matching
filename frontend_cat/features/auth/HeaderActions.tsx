"use client";

import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/useAuth";

import { AdminAccessButton } from "./AdminAccessButton";
import { ProfileMenu } from "./ProfileMenu";
import { RoleChangeBell } from "./RoleChangeBell";

// Everything in the Explore header that depends on who's logged in — the
// role-change bell, the Admin link/request button, and the profile menu —
// bundled into one client component so app/explore/page.tsx (a Server
// Component) doesn't need to become one just to call useAuth().
export function HeaderActions() {
  const {
    user,
    role,
    displayName,
    orgRole,
    adminGrantUnseen,
    roleChangeNotice,
    dismissRoleChangeNotice,
    logout,
  } = useAuth();
  const router = useRouter();

  if (!user) return null;

  return (
    <div className="flex items-center gap-1">
      <RoleChangeBell notice={roleChangeNotice} onDismiss={dismissRoleChangeNotice} />
      <AdminAccessButton adminGrantUnseen={adminGrantUnseen} />
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
  );
}
