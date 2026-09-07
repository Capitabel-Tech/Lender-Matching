import { apiPost } from "./client";

// Called once, right after createUserWithEmailAndPassword succeeds — a
// brand new Firebase account has no role at all until this runs, which is
// what actually grants "business" (Explore-only) access, the starting tier
// for every new signup. See backend_cat/app/business_api.py.
export function completeSignup(token: string): Promise<{ status: string }> {
  return apiPost<{ status: string }, Record<string, never>>("/api/v1/business/signup-complete", {}, token);
}
