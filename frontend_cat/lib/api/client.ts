const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// The backend's error body is JSON like {"detail": "..."} — this pulls out
// that plain-English detail instead of showing the raw JSON to the user.
export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    try {
      const parsed = JSON.parse(err.message);
      if (parsed && typeof parsed.detail === "string") return parsed.detail;
    } catch {
      // not JSON — fall through to the raw message below
    }
    return err.message;
  }
  return "Something went wrong. Check the backend is running and try again.";
}

// Explore Lenders now requires a logged-in account (business or admin) —
// see backend_cat/app/auth.py's require_any_role — so every
// caller of these two needs to pass the current Firebase ID token. Optional
// only because a couple of call sites (e.g. a server component with no
// browser session to read) may have no token to give; the backend will
// simply reject those with 401, same as any other missing-token request.
export async function apiGet<TResponse>(path: string, token?: string | null): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new ApiError(detail || `Request failed with status ${response.status}`, response.status);
  }

  return response.json() as Promise<TResponse>;
}

export async function apiPost<TResponse, TBody>(path: string, body: TBody, token?: string | null): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new ApiError(detail || `Request failed with status ${response.status}`, response.status);
  }

  return response.json() as Promise<TResponse>;
}
