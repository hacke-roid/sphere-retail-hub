import ProductRepository from "../repositories/ProductRepository";
import CategoryService from "../../categories/services/CategoryService";

const stringValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : undefined;

const numberValue = (value: unknown, fallback = 0) => {
  const parsed = typeof value === "number" ? value : Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
};

const booleanValue = (value: unknown, fallback: boolean) =>
  typeof value === "boolean" ? value : fallback;

const listValue = (value: unknown) => (Array.isArray(value) ? value : []);

const sanitizeProductInput = (
  tenantId: string,
  input: Record<string, unknown>,
  isCreate: boolean,
) => {
  const payload: Record<string, unknown> = {
    tenantId,
    categoryId: stringValue(input.categoryId),
    name: stringValue(input.name),
    description: stringValue(input.description),
    images: listValue(input.images).map(stringValue).filter(Boolean),
    price: numberValue(input.price),
    stockQuantity: numberValue(input.stockQuantity),
    showStock: booleanValue(input.showStock, true),
    isAvailable: booleanValue(input.isAvailable, true),
    isFeatured: booleanValue(input.isFeatured, false),
    tags: listValue(input.tags).map(stringValue).filter(Boolean),
  };

  if (!isCreate) {
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });
  }

  return payload;
};

class ProductService {
  create(tenantId: string, input: Record<string, unknown>) {
    const payload = sanitizeProductInput(tenantId, input, true);

    if (!payload.name) {
      throw new Error("Product name is required");
    }

    return ProductRepository.create(payload);
  }

  async list(tenantId: string, query: Record<string, string | undefined>) {
    const [products, categories] = await Promise.all([
      ProductRepository.list({
      tenantId,
      categoryId: query.categoryId,
      search: query.search,
      featured: query.featured === "true" ? true : undefined,
      availableOnly: query.availableOnly !== "false",
      }),
      CategoryService.list(tenantId),
    ]);
    const categoryNameById = new Map(
      categories.map((category) => [category.id, category.name]),
    );

    return products.map((product) => ({
      ...product,
      categoryName: product.categoryId
        ? categoryNameById.get(product.categoryId) || "Uncategorized"
        : "Uncategorized",
    }));
  }

  async pageData(tenantId: string, query: Record<string, string | undefined>) {
    const products = await this.list(tenantId, query);

    return {
      metrics: {
        totalProducts: products.length,
        availableProducts: products.filter((product) => product.isAvailable).length,
        featuredProducts: products.filter((product) => product.isFeatured).length,
        outOfStockProducts: products.filter(
          (product) => (product.stockQuantity || 0) <= 0,
        ).length,
      },
      products,
    };
  }

  getById(tenantId: string, id: string) {
    return ProductRepository.findById(tenantId, id);
  }

  update(tenantId: string, id: string, input: Record<string, unknown>) {
    return ProductRepository.update(tenantId, id, sanitizeProductInput(tenantId, input, false));
  }

  delete(tenantId: string, id: string) {
    return ProductRepository.delete(tenantId, id);
  }
}

export default new ProductService();
