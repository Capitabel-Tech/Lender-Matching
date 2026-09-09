"use client";

import { useState } from "react";

const ROLE_LABELS: Record<string, string> = {
  business: "Business",
  admin: "Admin",
};

function initials(name: string | null, email: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  return email[0]?.toUpperCase() ?? "?";
}

// A small avatar button in the header that opens a dropdown with who's
// logged in (name, their role in the org, email, access tier) and a sign
// out control — the same info everywhere someone's logged in, so they
// never have to guess which account they're using.
export function ProfileMenu({
  email,
  displayName,
  orgRole,
  role,
  onLogout,
}: {
  email: string;
  displayName: string | null;
  orgRole: string | null;
  role: string | null;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);

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
        aria-label="Account menu"
        title={displayName ?? email}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500/20 text-xs font-bold text-brand-300 hover:bg-brand-500/30"
      >
        {initials(displayName, email)}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-white/10 bg-[#101D3D] p-3 text-xs shadow-xl">
          <p className="truncate font-semibold text-[#FFFFFF]">{displayName ?? "—"}</p>
          {orgRole && <p className="mt-0.5 truncate text-[#A9B4C9]">{orgRole}</p>}
          <p className="mt-1 truncate text-[#A9B4C9]">{email}</p>
          <p className="mt-2 inline-flex rounded-full border border-brand-800 bg-brand-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-400">
            {role ? ROLE_LABELS[role] ?? role : "No access"}
          </p>
          <button
            onClick={onLogout}
            className="mt-3 w-full rounded-md border border-white/10 py-1.5 text-center font-semibold text-red-300 hover:bg-white/5"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
