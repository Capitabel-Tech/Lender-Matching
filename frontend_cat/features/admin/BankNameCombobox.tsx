"use client";

import { useEffect, useState } from "react";

import { adminApi } from "@/lib/api/admin";

const MAX_SUGGESTIONS = 8;

export function BankNameCombobox({
  value,
  onChange,
  getToken,
}: {
  value: string;
  onChange: (value: string) => void;
  getToken: () => Promise<string | null>;
}) {
  const [banks, setBanks] = useState<string[] | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getToken().then(async (token) => {
      if (!token || cancelled) return;
      try {
        const options = await adminApi.listAmbakBanks(token);
        if (!cancelled) setBanks(options.map((o) => o.name));
      } catch {
        // Picker still works as a plain free-text field if the catalog
        // fetch fails — just no suggestions to show.
        if (!cancelled) setBanks([]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  const query = value.trim().toLowerCase();
  const suggestions = query
    ? (banks ?? []).filter((name) => name.toLowerCase().includes(query)).slice(0, MAX_SUGGESTIONS)
    : (banks ?? []).slice(0, MAX_SUGGESTIONS);

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        placeholder="e.g. SBI, or search Ambak's lender list…"
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
      />
      <p className="mt-1 text-xs text-zinc-400">
        Pick from Ambak&rsquo;s lender list where you can (keeps daily rate updates matching), or just type any name.
      </p>
      {open && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {suggestions.map((name) => (
            <li key={name}>
              <button
                type="button"
                // onMouseDown (not onClick) fires before the input's onBlur
                // closes this list, otherwise the click would be swallowed.
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(name);
                  setOpen(false);
                }}
                className="block w-full px-3 py-1.5 text-left text-sm hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
