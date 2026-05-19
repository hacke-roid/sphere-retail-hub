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

export type UpdateTenantPayload = Partial<CreateTenantPayload>;

export type UpdateUserPayload = {
  name?: string;
  email?: string;
  role?: "super_admin" | "admin" | "member";
  tenantId?: string;
  status?: "active" | "inactive" | "suspended";
};

export type TenantOption = {
  id: string;
  name: string;
};

export type CategoryOption = {
  id: string;
  name: string;
  icon?: string;
  imageUrl?: string;
};

export type ProductPayload = {
  name: string;
  categoryId?: string;
  description?: string;
  images: string[];
  price: number;
  stockQuantity: number;
  showStock: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  tags: string[];
};

export type CategoryPayload = {
  name: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  parentId?: string;
  isActive: boolean;
};

export type ShopConfiguration = {
  tenantId?: string;
  shopName: string;
  logoUrl?: string;
  theme: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
    layout?: string;
    wideLayout?: boolean;
    cardShadows?: boolean;
    roundedCorners?: boolean;
  };
  contact: {
    email?: string;
    phone?: string;
    address?: string;
  };
  homepage: {
    sections: {
      bannerCarousel: boolean;
      categoryShowcase: boolean;
      featuredProducts: boolean;
      latestProducts: boolean;
      bestSellers: boolean;
    };
    productsPerRow: number;
    itemsPerPage: number;
    banners: Array<{
      id: string;
      title: string;
      subtitle?: string;
      imageUrl?: string;
      buttonLabel?: string;
      categoryId?: string;
      tone?: string;
    }>;
    categoryShowcase: Array<{
      id: string;
      categoryId: string;
      title?: string;
      imageUrl?: string;
    }>;
  };
  features: {
    productSearch: boolean;
    wishlist: boolean;
    productReviews: boolean;
    filters: boolean;
    sorting: boolean;
    addToCart: boolean;
    orderHistory: boolean;
    productRecommendations: boolean;
  };
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

export const getTenant = (id: string, token: string) =>
  request<{ success: boolean; tenant: PageRecord }>(`/v1/api/tenants/${id}`, {
    method: "GET",
    token,
  });

export const updateTenant = (
  id: string,
  payload: UpdateTenantPayload,
  token: string,
) =>
  request<{ success: boolean; tenant: PageRecord }>(`/v1/api/tenants/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    token,
  });

export const deleteTenant = (id: string, token: string) =>
  request<Record<string, never>>(`/v1/api/tenants/${id}`, {
    method: "DELETE",
    token,
  });

export const getUser = (id: string, token: string) =>
  request<{ success: boolean; user: PageRecord }>(`/v1/api/users/${id}`, {
    method: "GET",
    token,
  });

export const updateUser = (
  id: string,
  payload: UpdateUserPayload,
  token: string,
) =>
  request<{ success: boolean; user: PageRecord }>(`/v1/api/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    token,
  });

export const deleteUser = (id: string, token: string) =>
  request<Record<string, never>>(`/v1/api/users/${id}`, {
    method: "DELETE",
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

export const getConfiguration = (token: string) =>
  request<{ success: boolean; configuration: ShopConfiguration | null }>(
    "/v1/api/configurations",
    {
      method: "GET",
      token,
    },
  );

export const saveConfiguration = (payload: ShopConfiguration, token: string) =>
  request<{ success: boolean; configuration: ShopConfiguration }>(
    "/v1/api/configurations",
    {
      method: "PUT",
      body: JSON.stringify(payload),
      token,
    },
  );

export const listCategories = async (token: string): Promise<CategoryOption[]> => {
  const response = await request<{ success: boolean; categories: PageRecord[] }>(
    "/v1/api/categories",
    {
      method: "GET",
      token,
    },
  );

  return response.categories
    .filter((category) => category.isActive !== false)
    .map((category) => ({
      id: String(category.id || category._id || ""),
      name: String(category.name || "Unnamed Category"),
      icon: typeof category.icon === "string" ? category.icon : undefined,
      imageUrl: typeof category.imageUrl === "string" ? category.imageUrl : undefined,
    }))
    .filter((category) => category.id);
};

export const createProduct = (payload: ProductPayload, token: string) =>
  request<{ success: boolean; product: PageRecord }>("/v1/api/products", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  });

export const getProduct = (id: string, token: string) =>
  request<{ success: boolean; product: PageRecord }>(`/v1/api/products/${id}`, {
    method: "GET",
    token,
  });

export const updateProduct = (id: string, payload: ProductPayload, token: string) =>
  request<{ success: boolean; product: PageRecord }>(`/v1/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    token,
  });

export const deleteProduct = (id: string, token: string) =>
  request<Record<string, never>>(`/v1/api/products/${id}`, {
    method: "DELETE",
    token,
  });

export const createCategory = (payload: CategoryPayload, token: string) =>
  request<{ success: boolean; category: PageRecord }>("/v1/api/categories", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  });

export const getCategory = (id: string, token: string) =>
  request<{ success: boolean; category: PageRecord }>(`/v1/api/categories/${id}`, {
    method: "GET",
    token,
  });

export const updateCategory = (id: string, payload: CategoryPayload, token: string) =>
  request<{ success: boolean; category: PageRecord }>(`/v1/api/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    token,
  });

export const deleteCategory = (id: string, token: string) =>
  request<Record<string, never>>(`/v1/api/categories/${id}`, {
    method: "DELETE",
    token,
  });

export const uploadImage = (file: File, token: string) => {
  const formData = new FormData();
  formData.append("image", file);

  return request<{
    success: boolean;
    upload: {
      publicId: string;
      url: string;
      width: number;
      height: number;
      format: string;
    };
  }>("/v1/api/uploads/image", {
    method: "POST",
    body: formData,
    token,
  });
};
