"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchCategories, type CategoriesResponse } from "@/lib/api/explore";

// Fetches the current, real set of category option values once per mount —
// shared by the admin's product-editing form and bank list (so a value an
// admin just added via "Manage categories" is immediately usable/visible
// there without a redeploy) and, separately, by the borrower-facing
// ExplorePage. Returns null while loading; callers should render nothing/a
// loading state until it resolves rather than falling back to a stale
// hardcoded list. `refetch` re-fetches on demand — used right after an
// add/delete so the UI reflects the change without a full page reload.
export function useCategories(): [CategoriesResponse | null, () => void] {
  const [categories, setCategories] = useState<CategoriesResponse | null>(null);

  const refetch = useCallback(() => {
    fetchCategories().then(setCategories);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchCategories().then((data) => {
      if (!cancelled) setCategories(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return [categories, refetch];
}
