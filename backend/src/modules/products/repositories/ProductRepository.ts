import ProductModel, { ProductDocument } from "../models/Product";

export type ProductRecord = {
  id: string;
  tenantId: string;
  categoryId?: string;
  categoryName?: string;
  name: string;
  description?: string;
  images: string[];
  price: number;
  stockQuantity?: number;
  showStock: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  tags: string[];
  createdAt: string;
};

const toProductRecord = (product: ProductDocument): ProductRecord => ({
  id: product._id.toString(),
  tenantId: product.tenantId,
  categoryId: product.categoryId,
  name: product.name,
  description: product.description,
  images: product.images,
  price: product.price,
  stockQuantity: product.showStock ? product.stockQuantity : undefined,
  showStock: product.showStock,
  isAvailable: product.isAvailable,
  isFeatured: product.isFeatured,
  tags: product.tags,
  createdAt: product.createdAt.toISOString(),
});

class ProductRepository {
  async create(input: Record<string, unknown>) {
    const product = await ProductModel.create(input);
    return toProductRecord(product);
  }

  async list(filter: {
    tenantId: string;
    categoryId?: string;
    search?: string;
    featured?: boolean;
    availableOnly?: boolean;
  }) {
    const query: Record<string, unknown> = { tenantId: filter.tenantId };
    if (filter.categoryId) query.categoryId = filter.categoryId;
    if (filter.featured !== undefined) query.isFeatured = filter.featured;
    if (filter.availableOnly) query.isAvailable = true;
    if (filter.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: "i" } },
        { tags: { $regex: filter.search, $options: "i" } },
      ];
    }

    const products = await ProductModel.find(query).sort({ createdAt: -1 }).exec();
    return products.map(toProductRecord);
  }

  async findById(tenantId: string, id: string) {
    const product = await ProductModel.findOne({ _id: id, tenantId }).exec();
    return product ? toProductRecord(product) : undefined;
  }

  async update(tenantId: string, id: string, input: Record<string, unknown>) {
    const product = await ProductModel.findOneAndUpdate(
      { _id: id, tenantId },
      input,
      { new: true },
    ).exec();
    return product ? toProductRecord(product) : undefined;
  }

  async delete(tenantId: string, id: string) {
    await ProductModel.findOneAndDelete({ _id: id, tenantId }).exec();
  }
}

export default new ProductRepository();
