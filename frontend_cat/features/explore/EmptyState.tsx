"use client";

export function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-7 overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-b from-brand-50 via-white to-white px-8 py-16 text-center shadow-sm dark:border-brand-600 dark:from-brand-950/30 dark:via-brand-800 dark:to-brand-800">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <span className="absolute inset-0 animate-pulse rounded-full bg-brand-500/25 blur-xl" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 shadow-lg shadow-brand-700/40 ring-4 ring-white dark:ring-brand-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="38"
            height="38"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9.5V21h14V9.5" />
            <path d="M9 21v-6h6v6" />
          </svg>
        </div>
      </div>

      <h2 className="max-w-lg text-4xl font-black leading-[1.05] tracking-tight text-brand-800 sm:text-5xl dark:text-cream-100">
        Choose your employment type.
        <br />
        Meet your <span className="italic text-brand-700 dark:text-brand-400">match.</span>
      </h2>

      <p className="max-w-sm text-base font-medium italic text-brand-500 dark:text-brand-300">
        &ldquo;Every lender&apos;s rules start there — pick one to see who matches.&rdquo;
      </p>
    </div>
  );
}
