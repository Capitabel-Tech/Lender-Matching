"use client";

import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { EngineCore } from "@/features/landing/EngineFlow";
import { useAuth } from "@/lib/useAuth";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "600"] });

// Same company domain app/auth.py's require_login enforces for brand new
// accounts — shown here only so the form is honest about what happens
// next, not re-checked client-side (the backend is the real gate).
const COMPANY_DOMAIN = "capitabel.com";

function MailIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export default function AdminLoginPage() {
  const { user, error, completingLink, needsEmailConfirmation, sendLoginLink, confirmEmailAndCompleteLink } =
    useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [linkSentTo, setLinkSentTo] = useState<string | null>(null);

  // Fires once a link click (same device, via useAuth's mount effect, or
  // the "confirm your email" fallback below) actually signs someone in.
  // /admin itself checks the role and redirects to /admin/pending if this
  // account hasn't been approved yet — no need to duplicate that check here.
  useEffect(() => {
    if (user) router.push("/admin");
  }, [user, router]);

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const ok = await sendLoginLink(email);
    setSubmitting(false);
    if (ok) setLinkSentTo(email.trim());
  }

  async function handleConfirmEmail(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await confirmEmailAndCompleteLink(confirmEmail);
    setSubmitting(false);
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

      <div className="relative flex w-full max-w-2xl flex-col items-center">
        <Link
          href="/explore"
          className="mb-10 self-start rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-[#F5F7FA] transition-colors hover:border-white/20 hover:bg-white/10"
        >
          ← Back to the lender finder
        </Link>

        <div className="mb-12 flex flex-col items-center gap-4 text-center">
          <p className={`${mono.className} text-xs font-semibold uppercase tracking-[0.25em] text-[#18E0FF]`}>
            Lender Match Engine · Admin Console
          </p>
          <h1 className="text-[40px] font-bold leading-[1.05] tracking-tight sm:text-[52px]">
            Every lender&rsquo;s rules.
            <br />
            <span className="text-[#00D6C9]">One dashboard.</span>
          </h1>
        </div>

        <div className="flex w-full max-w-lg flex-col items-center gap-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-8 pb-9 pt-10 shadow-2xl backdrop-blur-md sm:px-12">
          <div className="relative h-[110px] w-[110px] shrink-0">
            <EngineCore />
          </div>

          {completingLink ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <p className={`${mono.className} text-[11px] font-semibold uppercase tracking-[0.2em] text-[#18E0FF]`}>
                One Moment
              </p>
              <h2 className="text-[28px] font-bold leading-[1.1] tracking-tight sm:text-[32px]">Signing you in…</h2>
            </div>
          ) : needsEmailConfirmation ? (
            <>
              <div className="flex flex-col items-center gap-3 text-center">
                <p className={`${mono.className} text-[11px] font-semibold uppercase tracking-[0.2em] text-[#18E0FF]`}>
                  Confirm To Continue
                </p>
                <h2 className="text-[28px] font-bold leading-[1.1] tracking-tight sm:text-[32px]">
                  Confirm your <span className="text-[#00D6C9]">email</span>
                </h2>
                <p className="max-w-xs text-sm leading-relaxed text-[#91A0AE]">
                  This link was opened on a different device or browser than the one you requested it from — type
                  your email again to finish signing in.
                </p>
              </div>
              {error && (
                <p className="w-full rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-center text-sm text-red-300">
                  {error}
                </p>
              )}
              <form onSubmit={handleConfirmEmail} className="flex w-full flex-col gap-3">
                <input
                  type="email"
                  required
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder={`you@${COMPANY_DOMAIN}`}
                  className="w-full rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-3 text-sm text-[#F5F7FA] outline-none focus:border-[#00D6C9]"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-[#00D6C9] px-5 py-3.5 text-sm font-semibold text-[#050B12] shadow-[0_0_28px_rgba(0,214,201,0.25)] transition-transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {submitting ? "Signing in…" : "Confirm and continue"}
                </button>
              </form>
            </>
          ) : linkSentTo ? (
            <>
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#00D6C9]/10 text-[#18E0FF] shadow-[0_0_24px_rgba(0,214,201,0.2)]">
                <MailIcon size={28} />
              </span>
              <div className="flex flex-col items-center gap-3 text-center">
                <p className={`${mono.className} text-[11px] font-semibold uppercase tracking-[0.2em] text-[#18E0FF]`}>
                  Check Your Inbox
                </p>
                <h2 className="text-[28px] font-bold leading-[1.1] tracking-tight sm:text-[32px]">
                  Link sent to <span className="text-[#00D6C9]">{linkSentTo}</span>
                </h2>
                <p className="max-w-xs text-sm leading-relaxed text-[#91A0AE]">
                  Click the link in that email to sign in — it also creates your access request, and{" "}
                  <span className="font-semibold text-[#F5F7FA]">a super admin just needs to approve it</span> before
                  you can get in.
                </p>
              </div>
              <button
                onClick={() => setLinkSentTo(null)}
                className="text-sm font-medium text-[#91A0AE] hover:text-[#F5F7FA]"
              >
                Use a different email
              </button>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center gap-3 text-center">
                <p className={`${mono.className} text-[11px] font-semibold uppercase tracking-[0.2em] text-[#18E0FF]`}>
                  Restricted Access
                </p>
                <h2 className="text-[32px] font-bold leading-[1.1] tracking-tight sm:text-[38px]">
                  Admin <span className="text-[#00D6C9]">Login</span>
                </h2>
                <p className="max-w-xs text-sm leading-relaxed text-[#91A0AE]">
                  New here? Signing in also creates your access request —{" "}
                  <span className="font-semibold text-[#F5F7FA]">a super admin just needs to approve it</span> before
                  you can get in.
                </p>
              </div>

              {error && (
                <p className="w-full rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-center text-sm text-red-300">
                  {error}
                </p>
              )}

              <form onSubmit={handleSendLink} className="flex w-full flex-col gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`you@${COMPANY_DOMAIN}`}
                  className="w-full rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-3 text-sm text-[#F5F7FA] outline-none focus:border-[#00D6C9]"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2.5 rounded-lg bg-white px-5 py-3.5 text-sm font-semibold text-zinc-800 shadow-[0_0_28px_rgba(0,214,201,0.25)] transition-transform hover:scale-[1.02] disabled:opacity-50"
                >
                  <MailIcon />
                  {submitting ? "Sending…" : "Send me a sign-in link"}
                </button>
              </form>
              <p className="text-xs text-[#91A0AE]/70">
                No password needed — works with any @{COMPANY_DOMAIN} email, whoever hosts it.
              </p>
            </>
          )}

          <p className={`${mono.className} text-[10px] uppercase tracking-[0.15em] text-[#91A0AE]/70`}>
            Lender<span className="text-[#00D6C9]">Match</span> · Admin Panel
          </p>
        </div>
      </div>
    </div>
  );
}
