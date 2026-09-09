"use client";

import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { auth } from "@/lib/firebase";
import { authErrorMessage } from "@/lib/useAuth";

// Reached from the "reset your password" email — see useAuth.ts's
// resetPassword, which points Firebase's emailed link here (with a
// confirm-password field) instead of Firebase's own default hosted page,
// which only ever asks for the new password once.
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const [status, setStatus] = useState<"checking" | "ready" | "invalid" | "done">("checking");
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth || !oobCode) {
      setStatus("invalid");
      return;
    }
    verifyPasswordResetCode(auth, oobCode)
      .then((resolvedEmail) => {
        setEmail(resolvedEmail);
        setStatus("ready");
      })
      .catch(() => setStatus("invalid"));
  }, [oobCode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords don't match.");
      return;
    }
    if (!auth || !oobCode) return;

    setSubmitting(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setStatus("done");
    } catch (err) {
      setFormError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex flex-1 flex-col items-center px-6 py-16 text-[#16264D] sm:px-10">
      <div className="relative flex w-full max-w-md flex-col items-center">
        <Link href="/" className="mb-8 self-start text-sm font-semibold text-brand-500 transition-colors hover:text-[#16264D]">
          ← Back to home
        </Link>
        <span className="mb-6 text-base font-bold tracking-tight">
          Lender<span className="text-[#F58220]">Match</span>
        </span>

        <div className="flex w-full flex-col gap-6 rounded-2xl border border-brand-100 bg-white px-8 pb-9 pt-10 shadow-xl">
          {status === "checking" && <p className="text-center text-sm text-brand-500">Checking your reset link…</p>}

          {status === "invalid" && (
            <>
              <h1 className="text-center text-xl font-bold">Reset link invalid</h1>
              <p className="text-center text-sm text-brand-500">
                This link has expired or has already been used. Go back to the login page and click
                &ldquo;Forgot password?&rdquo; again to get a new one.
              </p>
              <Link
                href="/login"
                className="mt-2 w-full rounded-lg bg-[#F58220] px-5 py-3.5 text-center text-sm font-semibold text-[#0F1A33] shadow-sm transition-transform hover:scale-[1.01]"
              >
                Back to login
              </Link>
            </>
          )}

          {status === "done" && (
            <>
              <h1 className="text-center text-xl font-bold">Password updated</h1>
              <p className="text-center text-sm text-brand-500">You can now log in with your new password.</p>
              <Link
                href="/login"
                className="mt-2 w-full rounded-lg bg-[#F58220] px-5 py-3.5 text-center text-sm font-semibold text-[#0F1A33] shadow-sm transition-transform hover:scale-[1.01]"
              >
                Log in
              </Link>
            </>
          )}

          {status === "ready" && (
            <>
              <h1 className="text-center text-xl font-bold">Set a new password</h1>
              {email && <p className="text-center text-sm text-brand-500">for {email}</p>}

              {formError && (
                <p className="w-full rounded-lg border border-error-500/30 bg-error-50 px-3 py-2 text-center text-sm text-error-700">
                  {formError}
                </p>
              )}

              <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="text-sm font-medium text-brand-500">
                    New password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-brand-200 bg-cream-50 px-3.5 py-3 text-sm text-[#16264D] outline-none focus:border-[#F58220] focus:bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-brand-500">
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-brand-200 bg-cream-50 px-3.5 py-3 text-sm text-[#16264D] outline-none focus:border-[#F58220] focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 w-full rounded-lg bg-[#F58220] px-5 py-3.5 text-sm font-semibold text-[#0F1A33] shadow-sm transition-transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {submitting ? "Saving…" : "Set new password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
