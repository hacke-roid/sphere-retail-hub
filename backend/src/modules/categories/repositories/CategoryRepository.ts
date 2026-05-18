import CategoryModel, { CategoryDocument } from "../models/Category";

export type CategoryRecord = {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  createdAt: string;
};

const toCategoryRecord = (category: CategoryDocument): CategoryRecord => ({
  id: category._id.toString(),
  tenantId: category.tenantId,
  name: category.name,
  description: category.description,
  parentId: category.parentId,
  isActive: category.isActive,
  createdAt: category.createdAt.toISOString(),
});

class CategoryRepository {
  async create(input: Record<string, unknown>) {
    const category = await CategoryModel.create(input);

    return toCategoryRecord(category);
  }

  async list(tenantId: string) {
    const categories = await CategoryModel.find({ tenantId })
      .sort({ name: 1 })
      .exec();

    return categories.map(toCategoryRecord);
  }

  async findById(tenantId: string, id: string) {
    const category = await CategoryModel.findOne({ _id: id, tenantId }).exec();

    return category ? toCategoryRecord(category) : undefined;
  }

  async update(tenantId: string, id: string, input: Record<string, unknown>) {
    const category = await CategoryModel.findOneAndUpdate(
      { _id: id, tenantId },
      input,
      { new: true },
    ).exec();

    return category ? toCategoryRecord(category) : undefined;
  }

  async delete(tenantId: string, id: string) {
    await CategoryModel.findOneAndDelete({ _id: id, tenantId }).exec();
  }
}

export default new CategoryRepository();
