import { request } from "./httpClient";

export type MemberCategory = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  icon: string;
  tone: string;
};

export type MemberProduct = {
  id: string;
  tenantId: string;
  categoryId?: string;
  categoryName: string;
  name: string;
  description?: string;
  image?: string;
  icon: string;
  price: number;
  stockQuantity?: number;
  isAvailable: boolean;
  isFeatured: boolean;
  rating: number;
  reviews: number;
};

export type MemberOrder = {
  id: string;
  status: "processing" | "delivered" | "cancelled";
  total: number;
  items: Array<{
    productId?: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  createdAt: string;
};

export type MemberDashboard = {
  shop: {
    id: string;
    name: string;
  };
  banners: Array<{
    id: string;
    title: string;
    subtitle: string;
    imageUrl?: string;
    buttonLabel?: string;
    categoryId?: string;
    icon: string;
    tone: "blue" | "pink" | string;
  }>;
  categories: MemberCategory[];
  featuredProducts: MemberProduct[];
  wishlistProductIds: string[];
  theme?: Record<string, string | boolean | undefined>;
  features?: Record<string, boolean | undefined>;
  layout?: {
    productsPerRow?: number;
    itemsPerPage?: number;
  };
};

export const getMemberDashboard = (token: string) =>
  request<{ success: boolean; dashboard: MemberDashboard }>("/v1/api/members/dashboard", {
    method: "GET",
    token,
  });

export const getMemberOrders = (token: string) =>
  request<{ success: boolean; orders: MemberOrder[] }>("/v1/api/members/orders", {
    method: "GET",
    token,
  });

export const getMemberWishlist = (token: string) =>
  request<{ success: boolean; wishlist: MemberProduct[] }>("/v1/api/members/wishlist", {
    method: "GET",
    token,
  });

export const addMemberWishlistItem = (token: string, productId: string) =>
  request<{ success: boolean; wishlist: MemberProduct[] }>("/v1/api/members/wishlist", {
    method: "POST",
    body: JSON.stringify({ productId }),
    token,
  });

export const removeMemberWishlistItem = (token: string, productId: string) =>
  request<{ success: boolean; wishlist: MemberProduct[] }>(
    `/v1/api/members/wishlist/${productId}`,
    {
      method: "DELETE",
      token,
    },
  );
