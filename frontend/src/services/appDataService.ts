import { request } from "./httpClient";
import type { AuthUser } from "../types/auth";
import type { AppView } from "../types/navigation";

export type DashboardMetrics = Record<string, number>;
export type TenantMetrics = Record<string, number>;
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

export type ApiRecord = {
  id: string;
  name: string;
  detail?: string;
  status?: string;
  updatedAt?: string;
};

type ListResponse = {
  tenants?: Array<Record<string, unknown>>;
  users?: Array<Record<string, unknown>>;
  products?: Array<Record<string, unknown>>;
  categories?: Array<Record<string, unknown>>;
  settings?: Array<Record<string, unknown>>;
  configuration?: Record<string, unknown> | null;
};

const titleCase = (value: string) => {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDate = (value: unknown) => {
  if (typeof value !== "string") return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toLocaleDateString();
};

const textValue = (value: unknown) => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return undefined;
};

const normalizeRecord = (
  record: Record<string, unknown>,
  fallbackName: string,
): ApiRecord => {
  return {
    id: textValue(record.id) || textValue(record._id) || fallbackName,

    name: textValue(record.name) || textValue(record.key) || fallbackName,

    detail:
      textValue(record.email) ||
      textValue(record.ownerEmail) ||
      textValue(record.type) ||
      textValue(record.role) ||
      textValue(record.subscriptionPlan),

    status:
      textValue(record.status) ||
      (typeof record.isAvailable === "boolean"
        ? record.isAvailable
          ? "available"
          : "unavailable"
        : undefined) ||
      (typeof record.isActive === "boolean"
        ? record.isActive
          ? "active"
          : "inactive"
        : undefined),

    updatedAt: formatDate(record.updatedAt) || formatDate(record.createdAt),
  };
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

export const getViewRecords = async (
  view: AppView,
  token: string,
  user: AuthUser,
): Promise<ApiRecord[]> => {
  // if (view === "profile") {
  //   return [
  //     {
  //       id: user.id,
  //       name: user.name,
  //       detail: user.email,
  //       status: user.status,
  //       updatedAt: formatDate(user.createdAt),
  //     },
  //   ];
  // }

  const paths: Partial<Record<AppView, string>> = {
    tenants: "/v1/api/tenants",
    users: "/v1/api/users",
    products: "/v1/api/products",
    // categories: "/v1/api/categories",
    // configuration: "/v1/api/configurations",
    settings: "/v1/api/settings",
  };

  const path = paths[view];

  if (!path) {
    return [];
  }

  const response = await request<ListResponse>(path, {
    method: "GET",
    token,
  });

  // if (view === "configuration") {
  //   return response.configuration
  //     ? [normalizeRecord(response.configuration, "Shop Configuration")]
  //     : [];
  // }

  const key = view as keyof ListResponse;
  const records = response[key];

  if (!Array.isArray(records)) {
    return [];
  }

  return records.map((record, index) =>
    normalizeRecord(record, `${titleCase(view)} ${index + 1}`),
  );
};
