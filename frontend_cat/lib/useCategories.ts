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
export function useCategories(getToken: () => Promise<string | null>): [CategoriesResponse | null, () => void] {
  const [categories, setCategories] = useState<CategoriesResponse | null>(null);

  const refetch = useCallback(() => {
    getToken()
      .then((token) => fetchCategories(token))
      .then(setCategories);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getToken is stable across renders
  }, []);

  useEffect(() => {
    let cancelled = false;
    getToken()
      .then((token) => fetchCategories(token))
      .then((data) => {
        if (!cancelled) setCategories(data);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getToken is stable across renders, run once on mount
  }, []);

  return [categories, refetch];
}
