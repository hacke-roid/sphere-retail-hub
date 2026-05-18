import CategoryRepository from "../repositories/CategoryRepository";

class CategoryService {
  create(tenantId: string, input: Record<string, unknown>) {
    return CategoryRepository.create({ ...input, tenantId });
  }

  list(tenantId: string) {
    return CategoryRepository.list(tenantId);
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
