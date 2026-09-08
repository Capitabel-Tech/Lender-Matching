"use client";

import Link from "next/link";

// Shown in the Explore header. Always just a link into /admin — that page
// itself now handles every state (needs to request access, request
// pending, access was revoked, just got promoted, or the real dashboard)
// with a full, clearly-styled page instead of a small popover here. The
// only thing this button still does is show a dot when there's something
// new to see there (a fresh admin-access grant not yet acknowledged).
export function AdminAccessButton({ adminGrantUnseen }: { adminGrantUnseen: boolean }) {
  return (
    <Link
      href="/admin"
      aria-label="Admin"
      title="Admin"
      className="relative flex items-center gap-2 rounded-full px-3.5 py-2.5 text-brand-200 hover:bg-brand-600 hover:text-brand-400"
    >
      <AdminIcon />
      <span className="text-sm font-bold uppercase tracking-wide">Admin</span>
      {adminGrantUnseen && (
        <span className="absolute right-2 top-1.5 h-2.5 w-2.5 rounded-full bg-brand-400 shadow-[0_0_6px_rgba(245,130,32,0.8)]" />
      )}
    </Link>
  );
}

function AdminIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
