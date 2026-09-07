import { apiPost } from "./client";

// Called once, right after createUserWithEmailAndPassword succeeds — a
// brand new Firebase account has no role at all until this runs, which is
// what actually grants Explore Lenders browsing access. See
// backend_cat/app/business_api.py.
export function completeBusinessSignup(token: string): Promise<{ status: string }> {
  return apiPost<{ status: string }, Record<string, never>>("/api/v1/business/signup-complete", {}, token);
}
