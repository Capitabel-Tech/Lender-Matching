import { apiPost } from "./client";

// Called once, right after createUserWithEmailAndPassword succeeds — a
// brand new Firebase account has no role at all until this runs, which is
// what actually grants "business" (Explore-only) access, the starting tier
// for every new signup. See backend_cat/app/business_api.py.
export function completeSignup(token: string, displayName: string, orgRole: string): Promise<{ status: string }> {
  return apiPost<{ status: string }, { display_name: string; org_role: string }>(
    "/api/v1/business/signup-complete",
    { display_name: displayName, org_role: orgRole },
    token,
  );
}

// Flags the account as wanting admin access — shows up on the super
// admin's Manage Admins screen. Doesn't grant anything by itself.
export function requestAdminAccess(token: string): Promise<{ status: string }> {
  return apiPost<{ status: string }, Record<string, never>>("/api/v1/business/request-admin", {}, token);
}
