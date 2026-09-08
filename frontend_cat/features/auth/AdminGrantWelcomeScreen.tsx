"use client";

import { useState } from "react";

// Shown once, the first time an account opens /admin after being promoted
// — before the real dashboard. Confirms the promotion actually happened
// (rather than a silent redirect) and repeats the "this edits the live
// database" warning one more time right before they get in.
export function AdminGrantWelcomeScreen({
  displayName,
  onContinue,
}: {
  displayName: string | null;
  onContinue: () => Promise<boolean>;
}) {
  const [submitting, setSubmitting] = useState(false);

  async function handleContinue() {
    setSubmitting(true);
    await onContinue();
    setSubmitting(false);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-cream-100 px-4 py-14 dark:bg-brand-950 sm:px-8">
      <div className="w-full max-w-xl rounded-2xl border border-brand-200 bg-white p-8 text-center shadow-sm dark:border-brand-900/50 dark:bg-brand-800">
        <span className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-800 dark:bg-brand-950/60 dark:text-brand-300">
          Access granted
        </span>
        <h1 className="mt-4 text-2xl font-extrabold text-brand-800 dark:text-cream-100">
          You&rsquo;ve been granted admin access{displayName ? `, ${displayName}` : ""}!
        </h1>
        <p className="mt-2 text-base text-brand-500 dark:text-brand-200">
          You can now add and edit lender data, and manage other admins — including promoting or revoking their
          access.
        </p>

        <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-left dark:border-amber-900/60 dark:bg-amber-950/30">
          <p className="text-sm font-bold text-amber-900 dark:text-amber-300">⚠ One more reminder before you go in</p>
          <p className="mt-1 text-sm text-amber-800 dark:text-amber-400">
            Everything you change on the admin dashboard updates the live database directly and is immediately
            visible to everyone using Explore Lenders. There's no draft or review step.
          </p>
        </div>

        <button
          onClick={handleContinue}
          disabled={submitting}
          className="mt-7 w-full rounded-lg bg-brand-700 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.01] disabled:opacity-50"
        >
          {submitting ? "One moment…" : "Continue to Admin"}
        </button>
      </div>
    </div>
  );
}
