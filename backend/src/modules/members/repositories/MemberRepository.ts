import CategoryModel from "../../categories/models/Category";
import ProductModel from "../../products/models/Product";
import TenantModel from "../../tenants/models/Tenant";
import MemberOrderModel, { MemberOrderDocument } from "../models/MemberOrder";
import WishlistItemModel from "../models/WishlistItem";

export type MemberProductRecord = {
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

export type MemberCategoryRecord = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  icon: string;
  tone: string;
};

export type MemberOrderRecord = {
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

const categoryMeta = (name: string) => {
  const lowerName = name.toLowerCase();

  if (lowerName.includes("supplement") || lowerName.includes("vitamin")) {
    return { icon: "🥗", tone: "purple" };
  }

  if (lowerName.includes("device") || lowerName.includes("thermometer")) {
    return { icon: "🩺", tone: "cream" };
  }

  if (lowerName.includes("aid") || lowerName.includes("care")) {
    return { icon: "🧴", tone: "green" };
  }

  return { icon: "💊", tone: "blue" };
};

const productIcon = (product: { name: string; tags?: string[] }, categoryName: string) => {
  const tags = (product.tags || []).join(" ").toLowerCase();
  const combined = `${product.name} ${categoryName} ${tags}`.toLowerCase();

  if (combined.includes("device") || combined.includes("thermometer")) return "🩺";
  if (combined.includes("supplement") || combined.includes("vitamin")) return "🥗";
  if (combined.includes("first aid") || combined.includes("kit")) return "🧴";

  return "💊";
};

const toOrderRecord = (order: MemberOrderDocument): MemberOrderRecord => ({
  id: order._id.toString(),
  status: order.status,
  total: order.total,
  items: order.items.map((item) => ({
    productId: item.productId,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
  })),
  createdAt: order.createdAt.toISOString(),
});

class MemberRepository {
  async getTenantName(tenantId: string) {
    const tenant = await TenantModel.findById(tenantId).lean().exec();

    return tenant?.name || "Medical Store Pro";
  }

  async listCategories(tenantId: string): Promise<MemberCategoryRecord[]> {
    const categories = await CategoryModel.find({ tenantId, isActive: true })
      .sort({ name: 1 })
      .lean()
      .exec();

    return categories.map((category) => ({
      id: category._id.toString(),
      name: category.name,
      description: category.description,
      ...categoryMeta(category.name),
    }));
  }

  async listProducts(tenantId: string, filter: { featuredOnly?: boolean } = {}) {
    const categories = await CategoryModel.find({ tenantId }).lean().exec();
    const categoryById = new Map(
      categories.map((category) => [category._id.toString(), category.name]),
    );
    const query: Record<string, unknown> = {
      tenantId,
      isAvailable: true,
    };

    if (filter.featuredOnly) {
      query.isFeatured = true;
    }

    const products = await ProductModel.find(query).sort({ createdAt: -1 }).lean().exec();

    return products.map((product) => {
      const categoryName = product.categoryId
        ? categoryById.get(product.categoryId) || "Products"
        : "Products";

      return {
        id: product._id.toString(),
        tenantId: product.tenantId,
        categoryId: product.categoryId,
        categoryName,
        name: product.name,
        description: product.description,
        image: product.images?.[0],
        icon: productIcon(product, categoryName),
        price: product.price,
        stockQuantity: product.showStock ? product.stockQuantity : undefined,
        isAvailable: product.isAvailable,
        isFeatured: product.isFeatured,
        rating: 4,
        reviews: Math.max(12, product.name.length * 7),
      };
    });
  }

  async listOrders(userId: string, tenantId: string) {
    const orders = await MemberOrderModel.find({ userId, tenantId })
      .sort({ createdAt: -1 })
      .exec();

    return orders.map(toOrderRecord);
  }

  async listWishlist(userId: string, tenantId: string) {
    const wishlist = await WishlistItemModel.find({ userId, tenantId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    const productIds = wishlist.map((item) => item.productId);

    if (!productIds.length) {
      return [];
    }

    const products = await this.listProducts(tenantId);
    const productById = new Map(products.map((product) => [product.id, product]));

    return productIds
      .map((productId) => productById.get(productId))
      .filter(Boolean) as MemberProductRecord[];
  }

  async addWishlistItem(userId: string, tenantId: string, productId: string) {
    await WishlistItemModel.updateOne(
      { userId, productId },
      { $setOnInsert: { userId, tenantId, productId } },
      { upsert: true },
    ).exec();
  }

  async removeWishlistItem(userId: string, productId: string) {
    await WishlistItemModel.deleteOne({ userId, productId }).exec();
  }
}

export default new MemberRepository();
