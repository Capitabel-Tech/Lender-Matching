// A shared, branded loading state for admin screens that wait on one
// upfront fetch (categories, bank list, ...) — replaces a plain "Loading…"
// line with a centered spinner so a slow request doesn't read as a stalled
// or broken page.
export function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-teal-100 border-t-teal-600 dark:border-teal-950 dark:border-t-teal-400" />
      <p className="text-sm font-bold uppercase tracking-wide text-teal-700 dark:text-teal-400">Loading…</p>
    </div>
  );
}
