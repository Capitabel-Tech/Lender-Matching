"use client";

import Link from "next/link";
import { useState } from "react";

// The full page shown at /admin for a business account instead of the old
// small popover — explains what admin access actually is, warns that it
// edits the live database directly (no draft/review step), and lets them
// request it. Also handles the case where this specific account used to
// be an admin and was revoked, which needs a different headline than
// someone who's never asked before.
export function AdminAccessRequestScreen({
  displayName,
  revoked,
  adminRequested,
  requestAdminAccess,
}: {
  displayName: string | null;
  revoked: boolean;
  adminRequested: boolean;
  requestAdminAccess: () => Promise<boolean>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [justRequested, setJustRequested] = useState(false);
  const pending = adminRequested || justRequested;

  async function handleRequest() {
    setSubmitting(true);
    const ok = await requestAdminAccess();
    setSubmitting(false);
    if (ok) setJustRequested(true);
  }

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-14 dark:bg-zinc-950 sm:px-8">
      <div className="w-full max-w-xl">
        <Link
          href="/explore"
          className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← Back to the lender finder
        </Link>

        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {revoked ? (
            <>
              <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-700 dark:bg-red-950/50 dark:text-red-400">
                Access removed
              </span>
              <h1 className="mt-4 text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
                Your admin access was removed
              </h1>
              <p className="mt-2 text-base text-zinc-600 dark:text-zinc-300">
                {displayName ?? "Your account"}&rsquo;s admin access was taken away by another admin, so you
                can&rsquo;t open this dashboard right now. You can still use Explore Lenders as normal.
              </p>
            </>
          ) : (
            <>
              <span className="inline-flex rounded-full bg-teal-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                Admin access
              </span>
              <h1 className="mt-4 text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
                You need admin access for this
              </h1>
              <p className="mt-2 text-base text-zinc-600 dark:text-zinc-300">
                The admin dashboard is where lender data actually gets maintained — banks, interest rates,
                eligibility rules, property types, and who else has admin access.
              </p>
            </>
          )}

          <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/30">
            <p className="text-sm font-bold text-amber-900 dark:text-amber-300">
              ⚠ Changes here update the live database directly
            </p>
            <p className="mt-1 text-sm text-amber-800 dark:text-amber-400">
              There's no draft or review step — anything you add, edit, or delete on the admin dashboard is
              immediately visible to everyone using Explore Lenders. Double-check before you save.
            </p>
          </div>

          <ul className="mt-6 flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <li>• Only request this if maintaining lender data is actually part of your role.</li>
            <li>• An existing admin has to approve your request before you get in.</li>
            <li>• Once approved, you'll have full access — including promoting or revoking other admins.</li>
          </ul>

          <div className="mt-7">
            {pending ? (
              <div className="rounded-lg border border-teal-300 bg-teal-50 px-4 py-3 text-sm font-bold text-teal-800 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-300">
                Request sent — an existing admin still needs to review it. You&rsquo;ll get a notice here the moment
                they decide.
              </div>
            ) : (
              <button
                onClick={handleRequest}
                disabled={submitting}
                className="w-full rounded-lg bg-teal-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.01] disabled:opacity-50"
              >
                {submitting ? "Sending…" : revoked ? "Request admin access again" : "Request admin access"}
              </button>
            )}
          </div>

          <Link
            href="/explore"
            className="mt-3 flex w-full items-center justify-center rounded-lg bg-zinc-900 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.01] dark:bg-zinc-100 dark:text-zinc-900"
          >
            Return to Lenders Page
          </Link>
        </div>
      </div>
    </div>
  );
}
