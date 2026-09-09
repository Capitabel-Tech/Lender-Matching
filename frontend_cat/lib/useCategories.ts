"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchCategories, type CategoriesResponse } from "@/lib/api/explore";

// Fetches the current, real set of category option values once per mount —
// shared by the admin's product-editing form and bank list (so a value an
// admin just added via "Manage categories" is immediately usable/visible
// there without a redeploy). Returns null while loading; callers should
// render nothing/a loading state until it resolves rather than falling back
// to a stale hardcoded list. `refetch` re-fetches on demand — used right
// after an add/delete so the UI reflects the change without a full page
// reload.
//
// Takes getToken because /api/v1/explore/categories now requires a logged-in
// account (require_any_role) — both call sites (BanksSection,
// CategoriesSection) already have this from useAuth via their own props.
export function useCategories(
  getToken: () => Promise<string | null>,
): [CategoriesResponse | null, () => void, string | null] {
  const [categories, setCategories] = useState<CategoriesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const load = useCallback(async (attempt = 0): Promise<void> => {
    try {
      // getToken can throw (e.g. a transient "Database is closing" from
      // Firebase's IndexedDB layer) — this used to be a bare, uncaught
      // promise chain, so that error escaped unhandled and left
      // `categories` stuck at null forever (an infinite loading spinner
      // for every caller, since both render "loading" on `!categories`).
      const token = await getToken();
      const data = await fetchCategories(token);
      setCategories(data);
      setError(null);
    } catch (err) {
      // A transient Firebase hiccup is common enough to deserve one
      // silent retry before giving up and surfacing an error.
      if (attempt === 0) {
        await new Promise((resolve) => window.setTimeout(resolve, 500));
        return load(1);
      }
      setError(err instanceof Error ? err.message : "Couldn't load categories.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getToken is stable across renders
  }, []);

  const refetch = useCallback(() => {
    setError(null);
    setRetryKey((k) => k + 1);
  }, []);

  useEffect(() => {
    void load();
  }, [load, retryKey]);

  return [categories, refetch, error];
}
