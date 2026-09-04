"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/lib/useAuth";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.88-3.01c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.11A12 12 0 0 0 12 24Z"
      />
      <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.26A12 12 0 0 0 0 12c0 1.94.46 3.77 1.26 5.39l4.01-3.11Z" />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.94 1.19 15.23 0 12 0A12 12 0 0 0 1.26 6.61l4.01 3.11C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

export default function AdminLoginPage() {
  const { loginWithGoogle, error } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleGoogleLogin() {
    setSubmitting(true);
    await loginWithGoogle();
    setSubmitting(false);
    // /admin itself checks the role and redirects to /admin/pending if this
    // account hasn't been approved yet — no need to duplicate that check here.
    router.push("/admin");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-zinc-950">
      <Link
        href="/explore"
        className="mb-4 w-full max-w-sm text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        ← Back to the lender finder
      </Link>
      <div className="flex w-full max-w-sm flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Admin login</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Sign in with your Google account. First time here? This also creates your access request — a super admin
            just needs to approve it before you can get in.
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={handleGoogleLogin}
          disabled={submitting}
          className="flex items-center justify-center gap-2.5 rounded-lg border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
        >
          <GoogleIcon />
          {submitting ? "Signing in…" : "Continue with Google"}
        </button>
      </div>
    </div>
  );
}
