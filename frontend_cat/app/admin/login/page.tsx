"use client";

import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { EngineCore } from "@/features/landing/EngineFlow";
import { useAuth } from "@/lib/useAuth";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "600"] });

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
    <div className={`${spaceGrotesk.className} relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-[#050B12] px-4 py-16 text-[#F5F7FA]`}>
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

      <Link href="/explore" className="relative mb-8 text-sm font-medium text-[#91A0AE] hover:text-[#F5F7FA]">
        ← Back to the lender finder
      </Link>

      <div className="relative flex w-full max-w-md flex-col items-center gap-7 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-8 pb-9 pt-10 shadow-2xl backdrop-blur-md">
        <div className="relative h-[110px] w-[110px] shrink-0">
          <EngineCore />
        </div>

        <div className="flex flex-col items-center gap-3 text-center">
          <p className={`${mono.className} text-[11px] font-semibold uppercase tracking-[0.2em] text-[#18E0FF]`}>
            Restricted Access
          </p>
          <h1 className="text-[32px] font-bold leading-[1.1] tracking-tight sm:text-[38px]">
            Admin <span className="text-[#00D6C9]">Login</span>
          </h1>
          <p className="max-w-xs text-sm leading-relaxed text-[#91A0AE]">
            Sign in with your Google account. First time here? This also creates your access request —{" "}
            <span className="font-semibold text-[#F5F7FA]">a super admin just needs to approve it</span> before you
            can get in.
          </p>
        </div>

        {error && (
          <p className="w-full rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-center text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2.5 rounded-lg bg-white px-5 py-3.5 text-sm font-semibold text-zinc-800 shadow-[0_0_28px_rgba(0,214,201,0.25)] transition-transform hover:scale-[1.02] disabled:opacity-50"
        >
          <GoogleIcon />
          {submitting ? "Signing in…" : "Continue with Google"}
        </button>

        <p className={`${mono.className} text-[10px] uppercase tracking-[0.15em] text-[#91A0AE]/70`}>
          Lender<span className="text-[#00D6C9]">Match</span> · Admin Panel
        </p>
      </div>
    </div>
  );
}
