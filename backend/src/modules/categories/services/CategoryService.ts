import CategoryRepository from "../repositories/CategoryRepository";

class CategoryService {
  create(tenantId: string, input: Record<string, unknown>) {
    return CategoryRepository.create({ ...input, tenantId });
  }

  list(tenantId: string) {
    return CategoryRepository.list(tenantId);
  }

  async pageData(tenantId: string) {
    const categories = await this.list(tenantId);

    return {
      metrics: {
        totalCategories: categories.length,
        activeCategories: categories.filter((category) => category.isActive).length,
        nestedCategories: categories.filter((category) => category.parentId).length,
      },
      categories,
    };
  }

  getById(tenantId: string, id: string) {
    return CategoryRepository.findById(tenantId, id);
  }

  update(tenantId: string, id: string, input: Record<string, unknown>) {
    return CategoryRepository.update(tenantId, id, input);
  }

  delete(tenantId: string, id: string) {
    return CategoryRepository.delete(tenantId, id);
  }
}

export default new CategoryService();
