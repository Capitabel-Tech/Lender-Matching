// Mirrors backend_cat/app/explore_schemas.py — keep in sync.

import { apiGet, apiPost } from "./client";

export const FILTER_CATEGORIES = [
  "employment_type",
  "property_type",
  "property_usage",
  "property_stage",
  "property_location",
] as const;

export type FilterCategory = (typeof FILTER_CATEGORIES)[number];

export type CategoryFilters = Record<FilterCategory, string[]>;

// Age/income/obligations are entered fresh every time, never stored — see
// backend_cat/app/explore_schemas.py's ExploreFiltersIn.
export interface ExploreFilters extends CategoryFilters {
  age: number | null;
  monthly_income: number | null;
  obligations: number[];
}

export const EMPTY_FILTERS: ExploreFilters = {
  employment_type: [],
  property_type: [],
  property_usage: [],
  property_stage: [],
  property_location: [],
  age: null,
  monthly_income: null,
  obligations: [],
};

export interface ExploreProduct {
  bank_name: string;
  product_name: string;
  employment_type: string;
  property_type: string[];
  property_usage: string[];
  property_stage: string[];
  property_location: string[];
  bank_foir_pct: number | null;
  customer_foir_pct: number | null;
  foir_pass: boolean | null;
  max_emi: number | null;
  bank_max_tenure_years: number | null;
  final_tenure_years: number | null;
  max_loan_amount: number | null;
  interest_rate_pct: number;
  interest_rate_is_estimated: boolean;
  interest_rate_upper_pct: number | null;
}

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export interface ExploreResponse {
  results: ExploreProduct[];
  total: number;
  facets: Record<FilterCategory, FacetOption[]>;
}

export function exploreBanks(filters: ExploreFilters, token?: string | null): Promise<ExploreResponse> {
  return apiPost<ExploreResponse, ExploreFilters>("/api/v1/explore/banks", filters, token);
}

export interface LiveRate {
  bank_name: string;
  rate_pct: number;
}

// Powers the scrolling rate ticker — only banks whose rate was actually
// confirmed against Ambak (see backend_cat/app/explore_api.py's
// live_rates), sorted lowest rate first.
export function fetchLiveRates(token?: string | null): Promise<LiveRate[]> {
  return apiGet<LiveRate[]>("/api/v1/explore/live-rates", token);
}

export interface CategoryOption {
  value: string;
  label: string;
}

export interface PropertyTypeGroup {
  heading: string;
  values: string[];
}

export interface CategoriesResponse extends Record<FilterCategory, CategoryOption[]> {
  property_type_groups: PropertyTypeGroup[];
  // Admin-only category (Home Loan, Education Loan, ...) — not a borrower
  // filter, see backend_cat/app/explore.py's ADMIN_ONLY_CATEGORIES.
  loan_type: CategoryOption[];
}

// The current, real set of allowed values per filter category, plus
// property_type's grouping — public (no admin login needed), same status as
// live-rates above. See backend_cat/app/explore_api.py's list_categories.
// Both the borrower sidebar and the admin's product-editing form fetch this
// instead of hardcoding their own copy of the option lists, so a value an
// admin adds shows up in both places immediately, no redeploy needed.
export function fetchCategories(token?: string | null): Promise<CategoriesResponse> {
  return apiGet<CategoriesResponse>("/api/v1/explore/categories", token);
}
