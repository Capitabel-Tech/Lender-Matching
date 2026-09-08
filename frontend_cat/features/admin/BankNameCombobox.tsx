"use client";

import { useEffect, useRef, useState } from "react";

import { adminApi } from "@/lib/api/admin";

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
  const inputRef = useRef<HTMLInputElement>(null);

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
  // Every match shows, always — no arbitrary cap. The list scrolls
  // (max-h-56 overflow-y-auto below) instead of hiding results.
  const suggestions = query ? (banks ?? []).filter((name) => name.toLowerCase().includes(query)) : (banks ?? []);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        placeholder="e.g. SBI, or search the lender list…"
        className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm dark:border-brand-600 dark:bg-brand-950"
      />
      <p className="mt-1 text-xs text-brand-300">
        Pick from the suggested list where you can, or choose &ldquo;Other&rdquo; to type any name.
      </p>
      {open && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-brand-100 bg-white py-1 shadow-lg dark:border-brand-600 dark:bg-brand-800">
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
                className="block w-full px-3 py-1.5 text-left text-sm hover:bg-brand-50 dark:hover:bg-brand-950/40"
              >
                {name}
              </button>
            </li>
          ))}
          {suggestions.length === 0 && (
            <li className="px-3 py-1.5 text-sm text-brand-300">No matches — try &ldquo;Other&rdquo; below.</li>
          )}
          <li className="border-t border-brand-100 dark:border-brand-600">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setOpen(false);
                inputRef.current?.focus();
              }}
              className="block w-full px-3 py-1.5 text-left text-sm font-medium text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-950/40"
            >
              Other — type the bank&rsquo;s name
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
