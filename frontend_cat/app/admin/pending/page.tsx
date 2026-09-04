"use client";

import { Space_Grotesk } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { adminApi } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/client";
import { useAuth } from "@/lib/useAuth";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${spaceGrotesk.className} relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-[#050B12] px-4 py-16 text-center text-[#F5F7FA]`}>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(circle at 50% 0%, rgba(0,214,201,0.12) 0%, transparent 55%)" }}
      />
      <div className="relative flex w-full max-w-sm flex-col gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-2xl backdrop-blur-md">
        {children}
      </div>
    </div>
  );
}

export default function AdminPendingPage() {
  const { user, role, loading, logout, getToken, refreshStatus } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  // undefined = still checking whether a profile's been submitted yet
  const [hasProfile, setHasProfile] = useState<boolean | undefined>(undefined);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/admin/login");
      return;
    }
    if (role === "admin" || role === "super_admin") {
      router.push("/admin");
      return;
    }
    if (role === null) {
      (async () => {
        const token = await getToken();
        if (!token) return;
        try {
          const status = await adminApi.getStatus(token);
          setHasProfile(status.has_profile);
        } catch {
          setHasProfile(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getToken is stable; only re-run when auth state itself changes
  }, [loading, user, role, router]);

  async function submitProfile(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const token = await getToken();
      if (!token) return;
      await adminApi.submitProfile(token, name.trim(), phone.trim());
      setHasProfile(true);
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function checkAgain() {
    setChecking(true);
    await refreshStatus();
    setChecking(false);
  }

  if (loading || !user || role === "admin" || role === "super_admin" || hasProfile === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#050B12] text-sm text-[#91A0AE]">Checking…</div>
    );
  }

  if (!hasProfile) {
    return (
      <CardShell>
        <div>
          <h1 className="text-xl font-bold text-[#F5F7FA]">One more thing</h1>
          <p className="mt-1.5 text-sm text-[#91A0AE]">
            Signed in as <span className="font-medium text-[#F5F7FA]">{user.email}</span>. Tell us who you are so the
            super admin knows who's asking before approving.
          </p>
        </div>
        <form onSubmit={submitProfile} className="flex flex-col gap-4 text-left">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-[#91A0AE]">
              Full name
            </label>
            <input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2.5 text-sm text-[#F5F7FA] outline-none focus:border-[#00D6C9]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-sm font-medium text-[#91A0AE]">
              Phone number
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2.5 text-sm text-[#F5F7FA] outline-none focus:border-[#00D6C9]"
            />
          </div>
          {formError && <p className="text-sm text-red-400">{formError}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-[#00D6C9] px-5 py-3 text-sm font-semibold text-[#050B12] transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit request"}
          </button>
        </form>
      </CardShell>
    );
  }

  return (
    <CardShell>
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#00D6C9]/10 text-[#18E0FF]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      </span>
      <div>
        <h1 className="text-xl font-bold text-[#F5F7FA]">Waiting for approval</h1>
        <p className="mt-1.5 text-sm text-[#91A0AE]">
          Signed in as <span className="font-medium text-[#F5F7FA]">{user.email}</span>. A super admin needs to
          approve your access request before you can get into the admin panel.
        </p>
      </div>
      <button
        onClick={checkAgain}
        disabled={checking}
        className="rounded-lg bg-[#00D6C9] px-5 py-3 text-sm font-semibold text-[#050B12] transition-transform hover:scale-[1.02] disabled:opacity-50"
      >
        {checking ? "Checking…" : "Check again"}
      </button>
      <button
        onClick={async () => {
          await logout();
          router.push("/admin/login");
        }}
        className="text-sm font-medium text-[#91A0AE] hover:text-[#F5F7FA]"
      >
        Log out
      </button>
    </CardShell>
  );
}
