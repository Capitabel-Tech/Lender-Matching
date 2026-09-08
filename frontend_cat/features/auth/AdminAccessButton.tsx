"use client";

import Link from "next/link";
import { useState } from "react";

// Shown in the Explore header. Admin/super_admin accounts just get the
// usual link straight into /admin. A business account gets a button that
// explains why it can't get in and lets them ask a super admin for admin
// access instead of silently bouncing back and forth with /admin's own
// redirect guard (that used to just "blink").
export function AdminAccessButton({
  role,
  adminRequested,
  requestAdminAccess,
}: {
  role: "business" | "admin" | "super_admin" | null | undefined;
  adminRequested: boolean;
  requestAdminAccess: () => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [justRequested, setJustRequested] = useState(false);

  if (role === "admin" || role === "super_admin") {
    return (
      <Link
        href="/admin"
        aria-label="Admin login"
        title="Admin login"
        className="flex items-center gap-1.5 rounded-full px-3 py-2 text-zinc-400 hover:bg-zinc-800 hover:text-teal-400"
      >
        <AdminIcon />
        <span className="text-xs font-semibold uppercase tracking-wide">Admin</span>
      </Link>
    );
  }

  async function handleRequest() {
    setSubmitting(true);
    const ok = await requestAdminAccess();
    setSubmitting(false);
    if (ok) setJustRequested(true);
  }

  const pending = adminRequested || justRequested;

  return (
    <div
      className="relative"
      tabIndex={-1}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Admin access"
        title="Admin access"
        className="flex items-center gap-1.5 rounded-full px-3 py-2 text-zinc-400 hover:bg-zinc-800 hover:text-teal-400"
      >
        <AdminIcon />
        <span className="text-xs font-semibold uppercase tracking-wide">Admin</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-white/10 bg-[#08141D] p-3.5 text-xs shadow-xl">
          {pending ? (
            <>
              <p className="font-semibold text-[#F5F7FA]">Request pending</p>
              <p className="mt-1 text-[#91A0AE]">
                A super admin still needs to review your request — you&rsquo;ll get a notice here the moment they
                decide.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-[#F5F7FA]">You need admin access for this</p>
              <p className="mt-1 text-[#91A0AE]">
                The admin dashboard is for editing lender data. Ask a super admin to promote your account —
                they&rsquo;ll see your name, role, and email on their end.
              </p>
              <button
                onClick={handleRequest}
                disabled={submitting}
                className="mt-3 w-full rounded-md bg-[#00D6C9] py-1.5 text-center font-semibold text-[#050B12] disabled:opacity-50"
              >
                {submitting ? "Sending…" : "Request admin access"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function AdminIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
