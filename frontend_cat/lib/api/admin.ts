// Mirrors backend_cat/app/admin_schemas.py and backend_cat/app/admin_api.py.

import { ApiError } from "./client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

// Employment type is a plain string, not a fixed union — the real, current
// set of allowed values lives in the category_options table and is fetched
// at runtime via lib/api/explore.ts's fetchCategories (see lib/useCategories),
// specifically so an admin can add a new employment type from the "Manage
// categories" screen without a frontend code change.
export interface AdminProductDetail {
  employment_type: string;
  // Which loan product this is (Home Loan, Education Loan, ...) — admin
  // organization only for now, see lib/api/explore.ts's CategoriesResponse.loan_type.
  loan_type: string;
  property_type: string[];
  property_usage: string[];
  property_stage: string[];
  property_location: string[];
  foir_pct: number | null;
  max_tenure_years: number | null;
  interest_rate_pct: number;
  interest_rate_upper_pct: number | null;
  interest_rate_is_estimated: boolean;
}

export interface AdminProductOut extends AdminProductDetail {
  bank_name: string;
}

export interface AdminBankSummary {
  bank_name: string;
  source: string;
  employment_types: string[];
}

export interface AdminBiasIn {
  recent_borrowers_processed: number;
  relationship_note: string;
}

export interface AdminBiasOut extends AdminBiasIn {
  bank_name: string;
}

export interface AdminCategoryOptionIn {
  value: string;
  label: string;
  group_heading: string | null;
}

export interface AdminCategoryOptionOut extends AdminCategoryOptionIn {
  category_key: string;
}

export interface AmbakBankOption {
  name: string;
}

export interface AdminAccountOut {
  uid: string;
  email: string;
  role: "business" | "admin" | "super_admin";
}

export interface ActivityLogEntryOut {
  actor_email: string;
  action: string;
  ip_address: string | null;
  created_at: string;
}

async function adminRequest<TResponse>(
  path: string,
  token: string,
  options: { method?: string; body?: unknown } = {},
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new ApiError(detail || `Request failed with status ${response.status}`, response.status);
  }
  if (response.status === 204) return undefined as TResponse;
  return response.json() as Promise<TResponse>;
}

export const adminApi = {
  listBanks: (token: string) => adminRequest<AdminBankSummary[]>("/api/v1/admin/banks", token),

  getBankProducts: (token: string, bankName: string) =>
    adminRequest<AdminProductOut[]>(`/api/v1/admin/banks/${encodeURIComponent(bankName)}/products`, token),

  createBankProduct: (token: string, bankName: string, detail: AdminProductDetail) =>
    adminRequest<AdminProductOut>(`/api/v1/admin/banks/${encodeURIComponent(bankName)}/products`, token, {
      method: "POST",
      body: detail,
    }),

  updateBankProduct: (token: string, bankName: string, loanType: string, employmentType: string, detail: AdminProductDetail) =>
    adminRequest<AdminProductOut>(
      `/api/v1/admin/banks/${encodeURIComponent(bankName)}/products/${encodeURIComponent(loanType)}/${employmentType}`,
      token,
      { method: "PUT", body: detail },
    ),

  deleteBankProduct: (token: string, bankName: string, loanType: string, employmentType: string) =>
    adminRequest<void>(
      `/api/v1/admin/banks/${encodeURIComponent(bankName)}/products/${encodeURIComponent(loanType)}/${employmentType}`,
      token,
      { method: "DELETE" },
    ),

  deleteBank: (token: string, bankName: string) =>
    adminRequest<void>(`/api/v1/admin/banks/${encodeURIComponent(bankName)}`, token, { method: "DELETE" }),

  listBias: (token: string) => adminRequest<AdminBiasOut[]>("/api/v1/admin/bias", token),

  upsertBias: (token: string, bankName: string, data: AdminBiasIn) =>
    adminRequest<AdminBiasOut>(`/api/v1/admin/bias/${encodeURIComponent(bankName)}`, token, {
      method: "PUT",
      body: data,
    }),

  deleteBias: (token: string, bankName: string) =>
    adminRequest<void>(`/api/v1/admin/bias/${encodeURIComponent(bankName)}`, token, { method: "DELETE" }),

  addCategoryOption: (token: string, categoryKey: string, option: AdminCategoryOptionIn) =>
    adminRequest<AdminCategoryOptionOut>(`/api/v1/admin/categories/${encodeURIComponent(categoryKey)}`, token, {
      method: "POST",
      body: option,
    }),

  listAmbakBanks: (token: string) => adminRequest<AmbakBankOption[]>("/api/v1/admin/ambak-banks", token),

  deleteCategoryOption: (token: string, categoryKey: string, value: string) =>
    adminRequest<void>(
      `/api/v1/admin/categories/${encodeURIComponent(categoryKey)}/${encodeURIComponent(value)}`,
      token,
      { method: "DELETE" },
    ),

  listAdmins: (token: string) => adminRequest<AdminAccountOut[]>("/api/v1/admin/admins", token),

  revokeAdminAccess: (token: string, uid: string) =>
    adminRequest<{ status: string }>(`/api/v1/admin/admins/${encodeURIComponent(uid)}/revoke`, token, {
      method: "POST",
    }),

  // Promotes/demotes an already-assigned account between business, admin,
  // and super_admin.
  setAccountRole: (token: string, uid: string, newRole: "business" | "admin" | "super_admin") =>
    adminRequest<{ status: string; role: string }>(
      `/api/v1/admin/admins/${encodeURIComponent(uid)}/set-role?new_role=${encodeURIComponent(newRole)}`,
      token,
      { method: "POST" },
    ),

  getActivityLog: (token: string) => adminRequest<ActivityLogEntryOut[]>("/api/v1/admin/activity-log", token),
};
