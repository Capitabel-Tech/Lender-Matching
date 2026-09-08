"use client";

// A small bell that lights up when useAuth's 30s role poll notices this
// account's role changed (another admin promoted/demoted it) — see
// useAuth.ts's roleChangeNotice. Purely informational: the person's actual
// access already updated the moment the poll ran; this just tells them so.

const ROLE_LABELS: Record<string, string> = {
  business: "Business",
  admin: "Admin",
};

function roleLabel(role: string | null): string {
  if (role === null) return "no access";
  return ROLE_LABELS[role] ?? role;
}

export function RoleChangeBell({
  notice,
  onDismiss,
}: {
  notice: { from: string | null; to: string | null } | null;
  onDismiss: () => void;
}) {
  if (!notice) return null;

  return (
    <div className="relative">
      <button
        onClick={onDismiss}
        aria-label="Access level changed"
        title="Access level changed — click to dismiss"
        className="relative flex items-center justify-center rounded-full p-2 text-amber-400 hover:bg-white/10"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-400" />
      </button>
      <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-white/10 bg-[#08141D] p-3 text-xs shadow-xl">
        <p className="font-semibold text-[#F5F7FA]">Your access changed</p>
        <p className="mt-1 text-[#91A0AE]">
          You&rsquo;re now <span className="font-semibold text-[#00D6C9]">{roleLabel(notice.to)}</span>
          {notice.from ? (
            <>
              {" "}
              (was <span className="font-medium">{roleLabel(notice.from)}</span>)
            </>
          ) : null}
          .
        </p>
        <button onClick={onDismiss} className="mt-2 text-[#00D6C9] hover:underline">
          Dismiss
        </button>
      </div>
    </div>
  );
}
