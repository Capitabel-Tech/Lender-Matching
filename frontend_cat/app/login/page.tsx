"use client";

import { Space_Grotesk } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { EngineCore } from "@/features/landing/EngineFlow";
import { useAuth } from "@/lib/useAuth";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export default function LoginPage() {
  const { user, role, loading, error, signUpBusiness, loginBusiness } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Any real, assigned role (business/admin/super_admin) means they're
  // already in — send them straight to the tool instead of the form.
  useEffect(() => {
    if (!loading && user && role) router.push("/explore");
  }, [loading, user, role, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const ok = mode === "signup" ? await signUpBusiness(email, password) : await loginBusiness(email, password);
    setSubmitting(false);
    if (ok) router.push("/explore");
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
              onClick={() => setMode("login")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                mode === "login" ? "bg-[#00D6C9] text-[#050B12]" : "text-[#91A0AE] hover:text-[#F5F7FA]"
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                mode === "signup" ? "bg-[#00D6C9] text-[#050B12]" : "text-[#91A0AE] hover:text-[#F5F7FA]"
              }`}
            >
              Sign up
            </button>
          </div>

          {error && (
            <p className="w-full rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-center text-sm text-red-300">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-[#91A0AE]">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-3 text-sm text-[#F5F7FA] outline-none focus:border-[#00D6C9]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-[#91A0AE]">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-3 text-sm text-[#F5F7FA] outline-none focus:border-[#00D6C9]"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full rounded-lg bg-[#00D6C9] px-5 py-3.5 text-sm font-semibold text-[#050B12] shadow-[0_0_28px_rgba(0,214,201,0.25)] transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              {submitting ? "One moment…" : mode === "signup" ? "Create account" : "Log in"}
            </button>
          </form>

          <Link href="/admin/login" className="text-xs font-medium text-[#91A0AE] hover:text-[#F5F7FA]">
            Company admin? Sign in here instead →
          </Link>
        </div>
      </div>
    </div>
  );
}
