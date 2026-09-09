// A shared, branded loading state for admin screens that wait on one
// upfront fetch (categories, bank list, ...) — replaces a plain "Loading…"
// line with a centered spinner so a slow request doesn't read as a stalled
// or broken page.
export function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-700 dark:border-brand-950 dark:border-t-brand-400" />
      <p className="text-sm font-bold uppercase tracking-wide text-brand-800 dark:text-brand-400">Loading…</p>
    </div>
  );
}
