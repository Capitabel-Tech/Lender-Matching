"use client";

import { Space_Grotesk } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { EngineCore } from "@/features/landing/EngineFlow";
import { useAuth } from "@/lib/useAuth";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

// How long the "signed up successfully" message stays up before we sign the
// brand-new account back out and drop them at the login form — so signing
// up always ends with typing your email/password once, same as anyone else.
const SIGNUP_SUCCESS_DELAY_MS = 2000;

export default function LoginPage() {
  const { user, role, loading, error, signUp, login, logout, resetPassword } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [displayName, setDisplayName] = useState("");
  const [orgRole, setOrgRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Any real, assigned role (business/admin/super_admin) means they're
  // already in — send them straight to the tool instead of the form. Never
  // fires right after a signup: signUp deliberately doesn't force a role
  // refresh, so role stays null until this same account logs in for real.
  useEffect(() => {
    if (!loading && user && role) router.push("/explore");
  }, [loading, user, role, router]);

  function switchMode(next: "login" | "signup") {
    setMode(next);
    setResetSent(false);
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (mode === "signup") {
      if (password !== confirmPassword) {
        setFormError("Passwords don't match.");
        return;
      }
      setSubmitting(true);
      const ok = await signUp(email, password, displayName.trim(), orgRole.trim());
      setSubmitting(false);
      if (ok) {
        setSignupSuccess(true);
        setPassword("");
        setConfirmPassword("");
        window.setTimeout(async () => {
          await logout();
          setSignupSuccess(false);
          switchMode("login");
        }, SIGNUP_SUCCESS_DELAY_MS);
      }
      return;
    }

    setSubmitting(true);
    const ok = await login(email, password);
    setSubmitting(false);
    if (ok) router.push("/explore");
  }

  async function handleForgotPassword() {
    if (!email) {
      setResetSent(false);
      return;
    }
    setSubmitting(true);
    const ok = await resetPassword(email);
    setSubmitting(false);
    setResetSent(ok);
  }

  return (
    <div className={`${spaceGrotesk.className} relative flex flex-1 flex-col items-center overflow-hidden bg-[#050B12] px-6 py-16 text-[#F5F7FA] sm:px-10`}>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(circle at 50% 0%, rgba(0,214,201,0.16) 0%, transparent 55%)" }}
      />

      <div className="relative flex w-full max-w-lg flex-col items-center">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <span className="text-base font-bold tracking-tight">
            Lender<span className="text-[#00D6C9]">Match</span>
          </span>
          <h1 className="text-[32px] font-bold leading-[1.1] tracking-tight sm:text-[40px]">
            {mode === "signup" ? "Create your account" : "Sign in to explore"}
          </h1>
        </div>

        <div className="flex w-full flex-col items-center gap-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-8 pb-9 pt-10 shadow-2xl backdrop-blur-md sm:px-12">
          <div className="relative h-[90px] w-[90px] shrink-0">
            <EngineCore />
          </div>

          <div className="flex w-full rounded-full border border-white/10 bg-white/[0.04] p-1">
            <button
              type="button"
              onClick={() => switchMode("login")}
              disabled={signupSuccess}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-bold transition-colors disabled:opacity-40 ${
                mode === "login" ? "bg-[#00D6C9] text-[#050B12]" : "text-[#91A0AE] hover:text-[#F5F7FA]"
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              disabled={signupSuccess}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-bold transition-colors disabled:opacity-40 ${
                mode === "signup" ? "bg-[#00D6C9] text-[#050B12]" : "text-[#91A0AE] hover:text-[#F5F7FA]"
              }`}
            >
              Sign up
            </button>
          </div>

          {signupSuccess ? (
            <p className="w-full rounded-lg border border-teal-900/50 bg-teal-950/30 px-3 py-2 text-center text-sm text-teal-300">
              Signed up successfully! Taking you to log in…
            </p>
          ) : (
            <>
              {(formError || error) && (
                <p className="w-full rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-center text-sm text-red-300">
                  {formError || error}
                </p>
              )}
              {resetSent && !error && (
                <p className="w-full rounded-lg border border-teal-900/50 bg-teal-950/30 px-3 py-2 text-center text-sm text-teal-300">
                  If an account exists for that email, a reset link is on its way.
                </p>
              )}
            </>
          )}

          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
            {mode === "signup" && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="displayName" className="text-sm font-medium text-[#91A0AE]">
                    Full name
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    required
                    disabled={signupSuccess}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-3 text-sm text-[#F5F7FA] outline-none focus:border-[#00D6C9] disabled:opacity-50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="orgRole" className="text-sm font-medium text-[#91A0AE]">
                    Your role in the organization
                  </label>
                  <input
                    id="orgRole"
                    type="text"
                    required
                    disabled={signupSuccess}
                    placeholder="e.g. Loan Ops Manager"
                    value={orgRole}
                    onChange={(e) => setOrgRole(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-3 text-sm text-[#F5F7FA] outline-none placeholder:text-[#91A0AE]/50 focus:border-[#00D6C9] disabled:opacity-50"
                  />
                </div>
              </>
            )}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-[#91A0AE]">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                disabled={signupSuccess}
                placeholder="you@capitabel.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-3 text-sm text-[#F5F7FA] outline-none placeholder:text-[#91A0AE]/50 focus:border-[#00D6C9] disabled:opacity-50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-[#91A0AE]">
                  Password
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-medium text-[#00D6C9] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                disabled={signupSuccess}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-3 text-sm text-[#F5F7FA] outline-none focus:border-[#00D6C9] disabled:opacity-50"
              />
            </div>
            {mode === "signup" && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-[#91A0AE]">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  disabled={signupSuccess}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-3 text-sm text-[#F5F7FA] outline-none focus:border-[#00D6C9] disabled:opacity-50"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={submitting || signupSuccess}
              className="mt-2 w-full rounded-lg bg-[#00D6C9] px-5 py-3.5 text-sm font-semibold text-[#050B12] shadow-[0_0_28px_rgba(0,214,201,0.25)] transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              {submitting ? "One moment…" : mode === "signup" ? "Create account" : "Log in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
