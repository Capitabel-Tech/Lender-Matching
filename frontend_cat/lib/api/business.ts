import { apiPost } from "./client";

// Deliberately unauthenticated — called before login, from the login
// page's "Forgot password?". See backend_cat/app/business_api.py's
// check-email-exists for why: Firebase's own password-reset call refuses
// to say whether an email is registered, so this exists specifically so
// the login page can tell a mistyped email apart from "check your inbox".
export function checkEmailExists(email: string): Promise<{ exists: boolean }> {
  return apiPost<{ exists: boolean }, { email: string }>("/api/v1/business/check-email-exists", { email });
}

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

// Flags the account as wanting admin access — shows up on an existing
// admin's Manage Admins screen. Doesn't grant anything by itself.
export function requestAdminAccess(token: string): Promise<{ status: string }> {
  return apiPost<{ status: string }, Record<string, never>>("/api/v1/business/request-admin", {}, token);
}

// Clears the one-time "you've just been granted admin access" flag once
// the user has seen and dismissed that screen on /admin.
export function acknowledgeAdminGrant(token: string): Promise<{ status: string }> {
  return apiPost<{ status: string }, Record<string, never>>("/api/v1/business/acknowledge-admin-grant", {}, token);
}
