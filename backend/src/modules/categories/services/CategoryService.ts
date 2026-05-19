import CategoryRepository from "../repositories/CategoryRepository";
import CategoryModel from "../models/Category";
import ProductModel from "../../products/models/Product";

const sanitizeCategoryInput = (tenantId: string, input: Record<string, unknown>) => ({
  tenantId,
  name: typeof input.name === "string" ? input.name.trim() : "",
  description:
    typeof input.description === "string" ? input.description.trim() : undefined,
  icon: typeof input.icon === "string" ? input.icon.trim() : undefined,
  imageUrl: typeof input.imageUrl === "string" ? input.imageUrl.trim() : undefined,
  parentId: typeof input.parentId === "string" && input.parentId ? input.parentId : undefined,
  isActive: typeof input.isActive === "boolean" ? input.isActive : true,
});

class CategoryService {
  create(tenantId: string, input: Record<string, unknown>) {
    const payload = sanitizeCategoryInput(tenantId, input);

    if (!payload.name) {
      throw new Error("Category name is required");
    }

    return CategoryRepository.create(payload);
  }

  list(tenantId: string) {
    return CategoryRepository.list(tenantId);
  }

  async pageData(tenantId: string) {
    const categories = await this.list(tenantId);
    const [productCounts, subcategoryCounts] = await Promise.all([
      ProductModel.aggregate([
        { $match: { tenantId } },
        { $group: { _id: "$categoryId", count: { $sum: 1 } } },
      ]),
      CategoryModel.aggregate([
        { $match: { tenantId, parentId: { $exists: true, $ne: null } } },
        { $group: { _id: "$parentId", count: { $sum: 1 } } },
      ]),
    ]);
    const productCountByCategory = new Map(
      productCounts.map((item) => [String(item._id || ""), item.count as number]),
    );
    const subcategoryCountByCategory = new Map(
      subcategoryCounts.map((item) => [String(item._id || ""), item.count as number]),
    );
    const categoriesWithCounts = categories.map((category) => ({
      ...category,
      productCount: productCountByCategory.get(category.id) || 0,
      subcategoryCount: subcategoryCountByCategory.get(category.id) || 0,
    }));

    return {
      metrics: {
        totalCategories: categoriesWithCounts.length,
        activeCategories: categoriesWithCounts.filter((category) => category.isActive).length,
        nestedCategories: categoriesWithCounts.filter((category) => category.parentId).length,
      },
      categories: categoriesWithCounts,
    };
  }

  getById(tenantId: string, id: string) {
    return CategoryRepository.findById(tenantId, id);
  }

  update(tenantId: string, id: string, input: Record<string, unknown>) {
    return CategoryRepository.update(tenantId, id, sanitizeCategoryInput(tenantId, input));
  }

  delete(tenantId: string, id: string) {
    return CategoryRepository.delete(tenantId, id);
  }
}

export default new CategoryService();
