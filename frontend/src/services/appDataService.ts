import { request } from "./httpClient";
import type { AuthUser } from "../types/auth";
import type { AppView } from "../types/navigation";

export type DashboardMetrics = Record<string, number>;
export type PageMetrics = Record<string, number>;

export type PageRecord = Record<string, unknown> & {
  id?: string;
  _id?: string;
  name?: string;
  key?: string;
  email?: string;
  ownerEmail?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PageData = {
  metrics: PageMetrics;
  records: PageRecord[];
  raw: Record<string, unknown>;
};

export type DashboardResponse = {
  success: boolean;
  dashboard?: {
    metrics?: DashboardMetrics;
    tenantTypes?: Array<{ type: string; count: number }>;
    revenueTrend?: Array<Record<string, number | string>>;
  };
  analytics?: {
    metrics?: DashboardMetrics;
    tenantTypes?: Array<{ type: string; count: number }>;
    revenueTrend?: Array<Record<string, number | string>>;
    productTrend?: Array<Record<string, number | string>>;
  };
};

type ListResponse = {
  page?: Record<string, unknown>;
  tenants?: Array<Record<string, unknown>>;
  users?: Array<Record<string, unknown>>;
  products?: Array<Record<string, unknown>>;
  categories?: Array<Record<string, unknown>>;
  settings?: Array<Record<string, unknown>>;
  configuration?: Record<string, unknown> | null;
};

const textValue = (value: unknown) => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return undefined;
};

export const getDashboard = (
  user: AuthUser,
  token: string,
): Promise<DashboardResponse> => {
  if (user.role === "super_admin") {
    return request<DashboardResponse>("/v1/api/analytics/dashboard", {
      method: "GET",
      token,
    });
  }

  if (user.role === "admin") {
    return request<DashboardResponse>("/v1/api/analytics/tenant", {
      method: "GET",
      token,
    });
  }

  return Promise.resolve<DashboardResponse>({
    success: true,
    dashboard: {
      metrics: {},
    },
  });
};

const pagePaths: Partial<Record<AppView, string>> = {
  tenants: "/v1/api/tenants/page",
  users: "/v1/api/users/page",
  products: "/v1/api/products/page",
  categories: "/v1/api/categories/page",
  configuration: "/v1/api/configurations/page",
  analytics: "/v1/api/analytics/platform",
  settings: "/v1/api/settings/page",
};

const getRecordsFromPage = (
  view: AppView,
  page: Record<string, unknown>,
): PageRecord[] => {
  if (Array.isArray(page.tenants)) return page.tenants as PageRecord[];
  if (Array.isArray(page.users)) return page.users as PageRecord[];
  if (Array.isArray(page.products)) return page.products as PageRecord[];
  if (Array.isArray(page.categories)) return page.categories as PageRecord[];
  if (Array.isArray(page.settings)) return page.settings as PageRecord[];
  if (view === "configuration" && page.configuration) {
    return [page.configuration as PageRecord];
  }

  return [];
};

const normalizePageRecord = (record: PageRecord, index: number): PageRecord => ({
  ...record,
  id:
    textValue(record.id) ||
    textValue(record._id) ||
    textValue(record.key) ||
    `${index + 1}`,
});

export const getPageData = async (
  view: AppView,
  token: string,
  user: AuthUser,
): Promise<PageData> => {
  if (view === "profile") {
    return {
      metrics: {
        profile: 1,
      },
      records: [
        {
          id: user.id,
          name: user.name,
          email: user.email,
          status: user.status,
          createdAt: user.createdAt,
        },
      ],
      raw: {},
    };
  }

  const path = pagePaths[view];

  if (!path) {
    return { metrics: {}, records: [], raw: {} };
  }

  const response = await request<ListResponse & { analytics?: Record<string, unknown> }>(
    path,
    {
      method: "GET",
      token,
    },
  );
  const page =
    response.page ||
    (response.analytics
      ? {
          metrics: response.analytics.metrics,
          records: [],
          ...response.analytics,
        }
      : {});

  return {
    metrics: (page.metrics as PageMetrics | undefined) || {},
    records: getRecordsFromPage(view, page).map(normalizePageRecord),
    raw: page,
  };
};

export type CreateTenantPayload = {
  name: string;
  type: string;
  ownerName: string;
  ownerEmail: string;
  subscriptionPlan?: string;
  status?: string;
  revenue?: number;
};

export type CreateUserPayload = {
  name: string;
  email: string;
  role: "admin" | "member";
  tenantId?: string;
};

export type TenantOption = {
  id: string;
  name: string;
};

export const createTenant = (payload: CreateTenantPayload, token: string) =>
  request<{ success: boolean; tenant: PageRecord }>("/v1/api/tenants", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  });

export const createUser = (payload: CreateUserPayload, token: string) =>
  request<{ success: boolean; user: PageRecord }>("/v1/api/users", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  });

export const searchTenants = async (token: string, search = "") => {
  const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
  const response = await request<{ success: boolean; tenants: PageRecord[] }>(
    `/v1/api/tenants${query}`,
    {
      method: "GET",
      token,
    },
  );

  return response.tenants.map((tenant) => ({
    id: String(tenant.id || tenant._id || ""),
    name: String(tenant.name || "Unnamed Tenant"),
  }));
};
